import { useState, useRef } from 'react';
import { useP2P } from '../../hooks/useP2P';
import { deterministicHex } from '../../utils/deterministicHex';
import Hyperswarm from 'hyperswarm';
import { HStack, IconButton } from '@chakra-ui/react';
import { PiPhoneCall } from 'react-icons/pi';
import { useRoom } from '../../hooks/useRoom';
import { CiMicrophoneOn, CiMicrophoneOff } from 'react-icons/ci';
import workletUrl from "../../assets/worklet.js?url";
import vadUrl from "../../assets/vad.js?url";


const SAMPLE_RATE = 44100;
const CHANNELS = 1;
const BUFFER_SIZE = 16384; // Smaller buffer size



let lastAudioEndTime = 0; // 🎯 Son oynatılan paketin bitiş zamanı
const BUFFER_DELAY = 0.04; // 🎯 50ms gecikme ekleyerek sabit çalma sağlar

function calculateRMS(buffer) {
    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i++) {
        sumSquares += buffer[i] * buffer[i];
    }
    return Math.sqrt(sumSquares / buffer.length);
}

const RMS_THRESHOLD = 189; // Gürültü eşiği, denemelerle bu değeri ayarlayabilirsin

function shouldSendAudio(buffer) {
    const rms = calculateRMS(buffer);
    return rms > RMS_THRESHOLD; // İnsan sesi olup olmadığını kontrol ediyoruz
}


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
    const vadWorkletNodeRef = useRef(null);
    const analyserRef = useRef(null)
    const audioQueue = useRef([])
    function sendAudio(dataArray) {
        if (!shouldSendAudio(dataArray)) {
            return
        }
        const frequencyData = getFrequencyData();
        if (frequencyData && isHumanVoice(frequencyData)) {
            const swarm$ = swarms[roomId.current + 'voice'];
            if (swarm$) {
                const buffer = Buffer.from(dataArray.buffer); // Direkt float32 olarak gönder
                for (const peer of [...swarm$.connections]) {
                    peer.write(buffer);
                }
            }
        }
    }


    function getFrequencyData() {
        if (!audioContextRef.current || !analyserRef.current) return null;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        return dataArray;
    }

    function isHumanVoice(frequencyData) {
        let voiceFrequency = 0;

        // 300Hz ile 3000Hz arasındaki frekansları kontrol et
        const startFreq = 300;   // Başlangıç frekansı
        const endFreq = 3000;    // Bitiş frekansı
        const startIndex = Math.floor(startFreq / SAMPLE_RATE * frequencyData.length);
        const endIndex = Math.floor(endFreq / SAMPLE_RATE * frequencyData.length);

        for (let i = startIndex; i < endIndex; i++) {
            voiceFrequency += frequencyData[i];
        }

        console.log(voiceFrequency)

        return voiceFrequency > 50; // Eğer toplam yoğunluk belirli bir değeri geçerse, insan sesi olma ihtimali yüksek
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
        await cleanupAudioResources()
        const swarm$ = swarms[roomId.current + 'voice'];
        await swarm$?.close?.()
        setInCall(false)
        setBusy(false)
    }

    async function cleanupAudioResources() {
        try {
            // Stop recording and clear stream
            if (stream.current) {
                const tracks = stream.current.getTracks();
                tracks.forEach(track => track.stop());
                stream.current = null;
            }
            audioQueue.current = []
            analyserRef.current = null
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
        } catch (error) {
            console.log('Error while cleanup, ', error)
        }
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
            highPassFilter.frequency.value = 300;

            const lowPassFilter = audioContextRef.current.createBiquadFilter();
            lowPassFilter.type = "lowpass";
            lowPassFilter.frequency.value = 4500;

            // 🔹 Dynamics Compressor kullan (noise gate gibi davranır)
            const compressor = audioContextRef.current.createDynamicsCompressor();
            compressor.threshold.value = -35; // 🎯 Gürültü eşiği (-40 dB)
            compressor.knee.value = 40;
            compressor.ratio.value = 12;
            compressor.attack.value = 0.001; // Hızlı tepki
            compressor.release.value = 0.25; // Çıkışı hızlı bırak


            const analyser = audioContextRef.current.createAnalyser();
            analyserRef.current = analyser


            // const compressor = audioContextRef.current.createDynamicsCompressor();
            // compressor.threshold.setValueAtTime(-50, audioContextRef.current.currentTime);  
            // compressor.knee.setValueAtTime(40, audioContextRef.current.currentTime); 
            // compressor.ratio.setValueAtTime(12, audioContextRef.current.currentTime);
            // compressor.attack.setValueAtTime(0.003, audioContextRef.current.currentTime); 
            // compressor.release.setValueAtTime(0.25, audioContextRef.current.currentTime);  

            await audioContextRef.current.audioWorklet.addModule(workletUrl);
            await audioContextRef.current.audioWorklet.addModule(vadUrl);
            if (!audioWorkletNodeRef.current) {
                audioWorkletNodeRef.current = new AudioWorkletNode(audioContextRef.current, "linear-pcm-processor", {
                    processorOptions: {
                        bufferSize: BUFFER_SIZE
                    }
                });
            }
            sourceNodeRef.current
                .connect(analyserRef.current)
                .connect(highPassFilter)
                .connect(lowPassFilter)
                .connect(compressor)
                .connect(audioWorkletNodeRef.current);

            audioWorkletNodeRef.current.port.onmessage = (e) => {
                const buffer = e.data;
                const volume = Math.max(...buffer);

                if (isMicOpen.current) {
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

            if (audioQueue.current.length > 5) {
                console.warn("🚨 Çok fazla ses paketi kuyruğa girdi, eski paketleri temizliyorum.");
                audioQueue.current.shift(); // Eski paketleri at
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

            // 🔹 Buffer kuyruğuna ekle
            audioQueue.current.push(audioBuffer);

            // 🔹 Kuyruğu zamanlayarak oynat
            playQueuedAudio();
        } catch (error) {
            console.error("🚨 Audio playback error:", error);
        }
    };

    const playQueuedAudio = () => {
        if (audioQueue.current.length === 0 || !audioContextRef.current) return;

        // 🔹 En eski buffer'ı al
        const audioBuffer = audioQueue.current.shift();
        if (!audioBuffer) return;

        if (audioQueue.current.length > 5) {
            audioQueue.current.shift(); // Buffer kuyruğunu temizle
        }

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);

        // 🎯 Sesin başlangıç zamanı = önceki sesin bitişi + buffer gecikmesi
        const currentTime = audioContextRef.current.currentTime;
        const playTime = Math.max(currentTime, lastAudioEndTime) + BUFFER_DELAY;
        source.start(playTime);

        // 🎯 Bitiş zamanını güncelle
        lastAudioEndTime = playTime + source.buffer.duration;

        source.onended = () => {
            source.disconnect();

            // 🔹 Buffer fazla dolmasın diye temizle (maksimum 10 buffer tut)
            if (audioQueue.current.length > 10) {
                audioQueue.current.splice(0, audioQueue.current.length - 10);
            }

            if (audioQueue.current.length > 0) {
                playQueuedAudio(); // Yeni buffer varsa devam et
            }
        };
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
