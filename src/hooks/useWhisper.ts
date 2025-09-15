
import { useState, useEffect, useRef, useCallback } from 'react';

// This interface defines the structure of the messages sent to the Whisper worker.
interface WhisperMessage {
  id: number;
  type: 'load' | 'transcribe';
  payload: any;
}

// This interface defines the structure of the messages received from the Whisper worker.
interface WhisperEventData {
  id: number;
  type: 'load' | 'transcribe' | 'error';
  payload: {
    status?: 'progress' | 'complete' | 'error';
    progress?: number;
    message?: string;
    error?: string;
    data?: {
      text: string;
    };
  };
}

export const useWhisper = () => {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messageIdRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize the Whisper worker.
    const whisperWorker = new Worker('/whisper/whisper.worker.js', {
      type: 'module'
    });

    whisperWorker.onmessage = (event: MessageEvent<WhisperEventData | any>) => {
      const { type, payload, message } = event.data;

      // Handle worker log messages
      if (type === 'log') {
        console.log('Worker Log:', message);
        return;
      }

      if (type === 'load') {
        if (payload.status === 'complete') {
          setIsModelLoading(false);
          setIsReady(true);
          setLoadingProgress(null);
          console.log('Whisper model loaded.');
        } else if (payload.status === 'progress') {
          setLoadingProgress(payload.progress || 0);
          if (payload.message) {
            console.log('Loading progress:', payload.message);
          }
        } else if (payload.status === 'error') {
          setIsModelLoading(false);
          setError(payload.error || 'Failed to load model');
          setLoadingProgress(null);
        }
      } else if (type === 'transcribe') {
        if (payload.status === 'complete' && payload.data) {
          setTranscript(payload.data.text);
          console.log('Transcription complete:', payload.data.text);
        } else if (payload.status === 'error') {
          setError(payload.error || 'Transcription failed');
        }
      } else if (type === 'error') {
        setError(payload.error || 'Unknown worker error');
        setIsModelLoading(false);
        setLoadingProgress(null);
      }
    };

    whisperWorker.onerror = (err) => {
      console.error('Worker error:', err);
      setError(`Worker error: ${err.message}`);
      setIsModelLoading(false);
      setLoadingProgress(null);
    };

    workerRef.current = whisperWorker;

    // Auto-load the model on initialization
    loadModel('ggml-base.bin');

    return () => {
      whisperWorker.terminate();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const postMessageToWorker = (type: 'load' | 'transcribe', payload: any) => {
    if (!workerRef.current) return;
    const id = messageIdRef.current++;
    const message: WhisperMessage = { id, type, payload };
    workerRef.current.postMessage(message);
  };

  const loadModel = useCallback((model = 'ggml-base.bin') => {
    setIsModelLoading(true);
    setIsReady(false);
    setError(null);
    setLoadingProgress(0);

    postMessageToWorker('load', {
      model: model,
    });
  }, []);

  const startRecording = useCallback(async () => {
    if (!isReady) {
      setError('Whisper 모델이 준비되지 않았습니다.');
      return;
    }
    if (isRecording) return;

    try {
      // Initialize audio context for proper audio processing
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribe(audioBlob);

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(100); // Record in 100ms chunks
      setIsRecording(true);
      setTranscript('');
      setError(null);
    } catch (err) {
      setError('마이크 접근이 거부되었거나 사용할 수 없습니다.');
      console.error(err);
    }
  }, [isReady, isRecording]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }, [isRecording]);

  const transcribe = async (audioBlob: Blob) => {
    if (!workerRef.current || !isReady || !audioContextRef.current) return;

    try {
      // Convert audio blob to audio buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      // Get audio data as Float32Array
      const audioData = audioBuffer.getChannelData(0);

      // Resample to 16kHz if necessary (Whisper requirement)
      const targetSampleRate = 16000;
      let resampledAudio = audioData;

      if (audioBuffer.sampleRate !== targetSampleRate) {
        const resampleRatio = audioBuffer.sampleRate / targetSampleRate;
        const targetLength = Math.floor(audioData.length / resampleRatio);
        resampledAudio = new Float32Array(targetLength);

        for (let i = 0; i < targetLength; i++) {
          const sourceIndex = Math.floor(i * resampleRatio);
          resampledAudio[i] = audioData[sourceIndex];
        }
      }

      postMessageToWorker('transcribe', {
        audio: {
          sampling_rate: targetSampleRate,
          data: resampledAudio,
        },
        language: 'auto', // Let Whisper detect the language
        translate: false,
      });
    } catch (err) {
      console.error('Audio processing error:', err);
      setError('오디오 처리 중 오류가 발생했습니다.');
    }
  };

  return { 
    isModelLoading, 
    isReady, 
    isRecording, 
    transcript, 
    error, 
    loadingProgress,
    startRecording, 
    stopRecording, 
    loadModel 
  };
};
