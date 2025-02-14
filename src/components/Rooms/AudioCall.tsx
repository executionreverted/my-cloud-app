import { useState, useRef } from 'react';
import { useP2P } from '../../hooks/useP2P';
import { deterministicHex } from '../../utils/deterministicHex';
import Hyperswarm from 'hyperswarm';
import { HStack, IconButton } from '@chakra-ui/react';
import { PiPhoneCall } from 'react-icons/pi';
import { useRoom } from '../../hooks/useRoom';
import { CiMicrophoneOn, CiMicrophoneOff } from 'react-icons/ci';
import workletUrl from "../../assets/worklet.js?url";


const SAMPLE_RATE = 44100;
const CHANNELS = 1;
const BUFFER_SIZE = 1024; // Smaller buffer size

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
            const buffer = Buffer.from(dataArray.buffer); // Direkt float32 olarak gönder
            for (const peer of [...swarm$.connections]) {
                peer.write(buffer);
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

    async function startRecording() {
        try {
            if (!isMicOpen.current) {
                return
            }
            setIsRecording(true);
            const userStream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: {
                    sampleRate: SAMPLE_RATE,
                    channelCount: CHANNELS,

                }
            });
            stream.current = userStream
            if (!audioContextRef.current || audioContextRef.current.state === "closed") {
                audioContextRef.current = new AudioContext();
            }
            sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(userStream);

            const highPassFilter = audioContextRef.current.createBiquadFilter();
            highPassFilter.type = "highpass";
            highPassFilter.frequency.value = 180;

            const lowPassFilter = audioContextRef.current.createBiquadFilter();
            lowPassFilter.type = "lowpass";
            lowPassFilter.frequency.value = 5000;

            const compressor = audioContextRef.current.createDynamicsCompressor();
            compressor.threshold.setValueAtTime(-50, audioContextRef.current.currentTime);  
            compressor.knee.setValueAtTime(40, audioContextRef.current.currentTime); 
            compressor.ratio.setValueAtTime(12, audioContextRef.current.currentTime);
            compressor.attack.setValueAtTime(0.003, audioContextRef.current.currentTime); 
            compressor.release.setValueAtTime(0.25, audioContextRef.current.currentTime);  


            await audioContextRef.current.audioWorklet.addModule(workletUrl);
            if (!audioWorkletNodeRef.current) {
                audioWorkletNodeRef.current = new AudioWorkletNode(audioContextRef.current, "linear-pcm-processor", {
                    processorOptions: {
                        bufferSize: BUFFER_SIZE
                    }
                });
            }
            sourceNodeRef.current
                .connect(highPassFilter)
                .connect(lowPassFilter)
                .connect(compressor)
                .connect(audioWorkletNodeRef.current);
            // audioWorkletNodeRef.current.connect(audioContextRef.current.destination);

            audioWorkletNodeRef.current.port.onmessage = (e) => {
                const buffer = e.data;
                const volume = Math.max(...buffer);

                console.log({ volume })
                // do something with it
                if (isMicOpen.current && volume > 400) {
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

    const playReceivedAudio = async (data) => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext({
                    sampleRate: SAMPLE_RATE,
                });
            }

            // 🔹 Veriyi doğru tipte al (Uint8 → Int16)
            const alignedBuffer = new Uint8Array(data);
            if (alignedBuffer.length % 2 !== 0) {
                console.error("Invalid buffer length:", alignedBuffer.length);
                return;
            }

            // 🔹 Int16 olarak oku (Little Endian)
            const int16Array = new Int16Array(alignedBuffer.buffer);

            // 🔹 Float32'e normalize et (0x7FFF = 32767)
            const float32Array = new Float32Array(int16Array.length);
            for (let i = 0; i < int16Array.length; i++) {
                float32Array[i] = int16Array[i] / 0x7FFF;
            }

            // 🔹 AudioBuffer oluştur ve oynat
            const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, SAMPLE_RATE);
            audioBuffer.getChannelData(0).set(float32Array);

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
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
