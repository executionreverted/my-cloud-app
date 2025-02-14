import { useState, useRef } from 'react';
import { useP2P } from '../../hooks/useP2P';
import { deterministicHex } from '../../utils/deterministicHex';
import Hyperswarm from 'hyperswarm';
import { HStack, IconButton } from '@chakra-ui/react';
import { PiPhoneCall } from 'react-icons/pi';
import { useRoom } from '../../hooks/useRoom';
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
    const processorRef = useRef(null)
    function sendAudio(dataArray) {
        const swarm$ = swarms[roomId.current + 'voice'];
        if (swarm$) {

            const int8Array = new Int8Array(dataArray.length);
            for (let i = 0; i < dataArray.length; i++) {
                int8Array[i] = dataArray[i] * 0x7F;  // Normalizasyon işlemi
            }
            const peers = [...swarm$.connections]; // Bağlı tüm peer'leri al
            for (const peer of peers) {
                peer.write(Buffer.from(int8Array.buffer))
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
                playReceivedAudio(data);
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
                await processorRef.current.close();
                audioContextRef.current = null;
                processorRef.current = null
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
            setIsRecording(true);
            const userStream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: {
                    sampleRate: 44100,
                    channelCount: 1,
                }
            });
            stream.current = userStream
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();
            }
            sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(userStream);
            processorRef.current = audioContextRef.current.createScriptProcessor(2048, 1, 1);

            processorRef.current.connect(audioContextRef.current.destination)
            sourceNodeRef.current.connect(processorRef.current)
            processorRef.current.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                console.log(inputData)
                if (isMicOpen.current) {
                    sendAudio(inputData);
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
