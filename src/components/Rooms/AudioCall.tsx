import React, { useState, useRef, useEffect } from 'react';
import { useP2P } from '../../hooks/useP2P';
import { deterministicHex } from '../../utils/deterministicHex';
import Hyperswarm from 'hyperswarm';
import { Button, HStack, IconButton, VStack } from '@chakra-ui/react';
import { PiPhoneCall } from 'react-icons/pi';
import { useRoom } from '../../hooks/useRoom';
import workletUrl from "../../assets/worklet.js?url";
import { CiMicrophoneOn, CiMicrophoneOff } from 'react-icons/ci';
// AudioProcessor.js'yi eklediğinizden emin olun (işlemci sınıfı)
const AudioCall = ({ }) => {
    const { swarms, encodeTopic } = useP2P();
    const { activeRoom } = useRoom();
    const stream = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [inCall, setInCall] = useState(false);
    const roomId = useRef(null);
    const audioContextRef = useRef(null);
    const isInCall = useRef(null);
    const isMicOpen = useRef(false);
    const [micOpen, setMicOpen] = useState(false)
    const [busy, setBusy] = useState(false)
    const sourceNodeRef = useRef(null);
    const audioWorkletNodeRef = useRef(null);

    function sendAudio(dataArray) {
        const buffer = Buffer.from(dataArray.buffer);
        const swarm$ = swarms[roomId.current + 'voice'];
        if (swarm$) {
            if (!dataArray || dataArray.length === 0) {
                console.error("Data array is empty or undefined!");
                return;
            }
            console.log('Buffer data: ', buffer);
            console.log('Buffer byteLength: ', buffer.byteLength);
            console.log("sending buffer", buffer)

            const int16Array = new Int16Array(dataArray.buffer);
            console.log("Int16Array view of the buffer:", int16Array);
            // Int16Array'a dönüştürme

            // Buffer'dan gönderme
            if (!int16Array.buffer) {
                console.error("Int16Array buffer is invalid or undefined!");
                return;
            }
            const peers = [...swarm$.connections]; // Bağlı tüm peer'leri al
            for (const peer of peers) {
                peer.write(Buffer.from(int16Array.buffer))
            }
        }
    }

    async function joinVoiceChat(_roomId) {
        setBusy(true)
        if (inCall) {
            await leaveCall()
        }

        console.log('Connecting to room ', _roomId);
        roomId.current = _roomId;
        const topic = deterministicHex(roomId.current + "voice");
        const encodedTopic = await encodeTopic(topic);
        const swarm = new Hyperswarm();
        swarm.roomId = roomId.current;

        // Swarm event listener
        swarm.on('connection', (connection) => {
            console.log('Connection established: ', connection);
            connection.on('data', (data) => {
                // Buffer'ı almak ve işlemek
                const buffer = new Uint8Array(data);
                const int16Array = new Int16Array(buffer.buffer);

                const float32Array = new Float32Array(int16Array.length);
                for (let i = 0; i < int16Array.length; i++) {
                    float32Array[i] = int16Array[i] / 0x7FFF;  // Normalizasyon
                }
                playReceivedAudio(float32Array);
            });
        });

        setInCall(true);
        await swarm.join(encodedTopic);
        swarms[roomId.current + "voice"] = swarm;
        await startRecording()
        setBusy(false)
    }


    async function leaveCall() {
        setBusy(true)
        await stopRecording()
        cleanupAudioResources()
        const swarm$ = swarms[roomId.current + 'voice'];
        await swarm$?.close?.()
        setInCall(false)
        setBusy(false)
    }

    async function cleanupAudioResources() {
        // Stop recording and clear stream
        if (stream.current) {
            const tracks = stream.current.getTracks();
            tracks.forEach(track => track.stop());
            stream.current = null;
        }

        // Disconnect and cleanup audio nodes
        if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }

        if (audioWorkletNodeRef.current) {
            audioWorkletNodeRef.current.disconnect();
            audioWorkletNodeRef.current.port.onmessage = null;
            audioWorkletNodeRef.current = null;
        }
        // Close AudioContext
        if (audioContextRef.current) {
            try {
                await audioContextRef.current.close();
                audioContextRef.current = null;
            } catch (error) {
                console.error("Error closing AudioContext:", error);
            }
        }
        setIsRecording(false);
        isMicOpen.current = false;
        setMicOpen(false);
        setInCall(false)
        isInCall.current = false
    }

    // Ses kaydını başlatma
    async function startRecording() {
        try {
            if (!isMicOpen.current) {
                return
            }
            const userStream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: {
                    sampleRate: 44100,
                    channelCount: 1,
                }
            });
            stream.current = userStream
            setIsRecording(true);
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();
            }
            sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(userStream);
            await audioContextRef.current.audioWorklet.addModule(workletUrl);

            audioWorkletNodeRef.current = new AudioWorkletNode(audioContextRef.current, "processor");
            sourceNodeRef.current.connect(audioWorkletNodeRef.current);

            console.log('Init : audio worklet')
            audioWorkletNodeRef.current.port.onmessage = (e) => {
                let buffer = e.data.audioData;
                // Veriyi Buffer'a dönüştür
                console.log('Received audio data:', buffer);
                if (buffer && isMicOpen.current) {
                    sendAudio(buffer);
                }
            };

        } catch (err) {
            console.error("Mikrofon erişimi sağlanamadı:", err);
        }
    }

    const stopRecording = () => {
        console.log('STOPPED.');
        if (stream.current) {
            const tracks = stream.current.getTracks();
            tracks.forEach(track => track.stop());
        }
        setIsRecording(false);
    };

    const playReceivedAudio = async (data, sampleRate = 44100) => {
        try {
            const audioContext = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: sampleRate
            });
            if (!audioContextRef.current) {
                audioContextRef.current = audioContext;
            }

            console.log('PLAYING AUDIO', data)

            const audioBuffer = audioContext.createBuffer(1, data.length, 44100);
            audioBuffer.getChannelData(0).set(data);

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start(0);
            source.onended = () => {
                source.disconnect();
            };
        } catch (error) {
            console.error("🚨 Audio playback error:", error);
        }
    };

    return (
        <HStack ml={"auto"} gap={2}>
            <IconButton disabled={busy} colorPalette={inCall ? "green" : "gray"} onClick={() => {
                if (!isInCall.current) {
                    joinVoiceChat(activeRoom.seed)
                    setInCall(true)
                    isInCall.current = true
                } else {
                    leaveCall()
                    setInCall(false)
                    isInCall.current = false
                }
            }}>
                <PiPhoneCall />
            </IconButton>
            <IconButton colorPalette={micOpen ? "green" : "gray"} onClick={() => {
                isMicOpen.current = !isMicOpen.current
                if (isMicOpen.current) {
                    startRecording()
                } else {
                    stopRecording()
                }
                setMicOpen(isMicOpen.current)
            }}>
                {micOpen ? <CiMicrophoneOn /> : <CiMicrophoneOff />}
            </IconButton>
        </HStack>
    );
};

export default AudioCall;
