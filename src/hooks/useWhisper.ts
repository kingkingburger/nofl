import { useState, useEffect, useRef, useCallback } from 'react';

// Interfaces (WhisperMessage, WhisperEventData)는 변경 없이 그대로 사용합니다.
interface WhisperMessage {
  id: number;
  type: 'load' | 'transcribe';
  payload: any;
}

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
  const messageIdRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const whisperWorker = new Worker('/whisper/whisper.worker.js', {
      type: 'module'
    });
    console.log('Whisper Worker가 생성되었습니다.');

    whisperWorker.onmessage = (event: MessageEvent<WhisperEventData | any>) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'load':
          handleLoadMessage(payload);
          break;
        case 'transcribe':
          handleTranscribeMessage(payload);
          break;
        case 'error':
          handleErrorMessage(payload);
          break;
        default:
          break;
      }
    };

    whisperWorker.onerror = (err) => {
      console.error('Worker error:', err);
      setError(`Worker error: ${err.message}`);
      setIsModelLoading(false);
      setLoadingProgress(null);
    };

    workerRef.current = whisperWorker;
    loadModel('ggml-base.bin');

    return () => {
      whisperWorker.terminate();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      audioContextRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMessage = (payload: WhisperEventData['payload']) => {
    if (payload.status === 'complete') {
      setIsModelLoading(false);
      setIsReady(true);
      setLoadingProgress(null);
      console.log('Whisper 모델 로딩 완료.');
    } else if (payload.status === 'progress') {
      setLoadingProgress(payload.progress || 0);
    } else {
      setIsModelLoading(false);
      setError(payload.error || '모델 로딩에 실패했습니다.');
      setLoadingProgress(null);
    }
  };

  const handleTranscribeMessage = (payload: WhisperEventData['payload']) => {
    if (payload.status === 'complete' && payload.data) {
      const transcribedText = payload.data.text.trim();
      if (transcribedText && transcribedText !== '[BLANK_AUDIO]') {
        setTranscript((prev) => prev + transcribedText + ' ');
        console.log('🎤 음성 변환 결과 추가:', transcribedText);
      }
    } else if (payload.status === 'error') {
      console.error('음성 변환 오류:', payload.error);
      // Worker 내부의 변환 실패는 에러로 처리할 수 있습니다.
      setError(payload.error || '음성 변환에 실패했습니다.');
    }
  };

  const handleErrorMessage = (payload: WhisperEventData['payload']) => {
    setError(payload.error || '알 수 없는 Worker 오류');
    setIsModelLoading(false);
    setLoadingProgress(null);
  };

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
    postMessageToWorker('load', { model });
  }, []);

  const startRecording = useCallback(async () => {
    if (!isReady || isRecording) return;

    setTranscript('');
    setError(null);

    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      }
      // 브라우저에 의해 정지된 AudioContext를 재활성화합니다.
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
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

      mediaRecorderRef.current.ondataavailable = (event) => {
        // [수정됨] 최소 Blob 크기를 확인하여 빈 청크를 필터링합니다.
        // 100바이트는 헤더만 있고 데이터는 없는 Blob을 거르기 위한 임의의 임계값입니다.
        if (event.data.size > 100) {
          transcribe(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        console.log('녹음이 중지되었습니다.');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);

    } catch (err) {
      console.error('마이크 접근 오류:', err);
      setError('마이크 접근이 거부되었거나 사용할 수 없습니다.');
    }
  }, [isReady, isRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const transcribe = async (audioBlob: Blob) => {
    if (!workerRef.current || !isReady || !audioContextRef.current) return;

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      const audioData = audioBuffer.getChannelData(0);

      // 리샘플링 로직은 그대로 유지 (견고성)
      const targetSampleRate = 16000;
      let resampledAudio = audioData;
      if (audioBuffer.sampleRate !== targetSampleRate) {
        const resampleRatio = audioBuffer.sampleRate / targetSampleRate;
        const targetLength = Math.floor(audioData.length / resampleRatio);
        resampledAudio = new Float32Array(targetLength);
        for (let i = 0; i < targetLength; i++) {
          resampledAudio[i] = audioData[Math.floor(i * resampleRatio)];
        }
      }

      postMessageToWorker('transcribe', {
        audio: {
          sampling_rate: targetSampleRate,
          data: resampledAudio,
        },
        language: 'ko',
        translate: false,
      });

    } catch (err) {
      // [수정됨] EncodingError를 정상적인 경고로 처리합니다.
      if (err instanceof DOMException && err.name === 'EncodingError') {
        console.warn('디코딩할 수 없는 오디오 청크를 건너뜁니다. (정상 동작)');
      } else {
        // 그 외의 예기치 않은 오류는 상태로 표시합니다.
        console.error('오디오 처리 중 예기치 않은 오류:', err);
        setError('오디오 처리 중 오류가 발생했습니다.');
      }
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