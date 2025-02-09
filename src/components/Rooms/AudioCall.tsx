import React, { useState, useEffect, useRef } from 'react';
import { useP2P } from '../../hooks/useP2P';
import { deterministicHex } from '../../utils/deterministicHex';
import Hyperswarm from 'hyperswarm';  
import { Button, IconButton } from '@chakra-ui/react';
import { PiVideoConferenceThin } from 'react-icons/pi';
import { useRoom } from '../../hooks/useRoom';




const AudioCall = ({ }) => {
    const { swarms, encodeTopic } = useP2P();
    const { activeRoom } = useRoom();
    const [stream, setStream] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [inCall, setInCall] = useState(false);
    const roomId = useRef(null);
    const audioContextRef = useRef(null);
    const processorRef = useRef(null);
    const isMicOpen = useRef(true);

    function sendAudio(dataArray) {
        const swarm$ = swarms[roomId.current + 'voice'];
        if (swarm$) {
            // Ses verisini sıkıştırarak iletmek için Int16Array yerine daha verimli bir format kullanılabilir
            const int8Array = new Int8Array(dataArray.length);
            for (let i = 0; i < dataArray.length; i++) {
                int8Array[i] = dataArray[i] * 0x7F;  // Normalizasyon işlemi
            }

            const peers = [...swarm$.connections];
            for (const peer of peers) {
                peer.write(Buffer.from(int8Array.buffer));
            }
        }
    }

    async function joinVoiceChat(_roomId) {
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
                playReceivedAudio(data);
            });
        });

        setInCall(true);
        await swarm.join(encodedTopic);
        swarms[roomId.current + "voice"] = swarm;
        startRecording();
    }

    function startRecording() {
        // Mikrofon erişimi ve ses işleme ayarları
        navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
                echoCancellation: true,   // Yankı engelleme
                noiseSuppression: true,   // Gürültü engelleme
                sampleRate: 44100,
                channelCount: 1,         // Mono ses
                autoGainControl: true    // Otomatik ses seviyesi kontrolü
            }
        })
            .then((userStream) => {
                setIsRecording(true);
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioContextRef.current.createMediaStreamSource(userStream);
                processorRef.current = audioContextRef.current.createScriptProcessor(2048, 1, 1);

                source.connect(processorRef.current);

                // Gain node ile ses seviyesi kontrolü
                const gainNode = audioContextRef.current.createGain();
                gainNode.gain.value = 1;  // Ses seviyesini artırabilirsin
                processorRef.current.connect(gainNode);
                gainNode.connect(audioContextRef.current.destination);

                processorRef.current.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    if (isMicOpen.current) {
                        sendAudio(inputData);
                    }
                };
            })
            .catch((err) => {
                console.error("Mikrofon erişimi sağlanamadı:", err);
            });
    }

    const stopRecording = () => {
        console.log('STOPPED.');
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            setStream(null);
        }
        setIsRecording(false);
    };

    const playReceivedAudio = async (data, sampleRate = 44100) => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Ses verisini işlemek için hizalama
            const alignedBuffer = new Uint8Array(data);
            if (alignedBuffer.length % 2 !== 0) {
                console.error("Invalid buffer length:", alignedBuffer.length);
                return;
            }

            const int8Array = new Int8Array(alignedBuffer.buffer);

            // Ses verisini Float32Array'e dönüştürme
            const float32Array = new Float32Array(int8Array.length);
            for (let i = 0; i < int8Array.length; i++) {
                float32Array[i] = int8Array[i] / 0x7F;
            }

            // AudioBuffer ile ses verisini oynatmak
            const audioBuffer = audioContext.createBuffer(1, float32Array.length, sampleRate);
            audioBuffer.getChannelData(0).set(float32Array);

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start(0);
        } catch (error) {
            console.error("🚨 Audio playback error:", error);
        }
    };

    return (
        <>
            <IconButton onClick={() => joinVoiceChat(activeRoom.seed)}>
                <PiVideoConferenceThin />
            </IconButton>
            <Button onClick={() => isMicOpen.current = !isMicOpen.current}>
                Toggle Mic
            </Button>
        </>
    );
};

export default AudioCall;
