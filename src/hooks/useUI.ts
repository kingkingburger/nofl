import { useState, useEffect, useRef } from 'react';

export const useUI = () => {
  const [opacity, setOpacity] = useState(1);
  const [isMiniMode, setIsMiniMode] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // if (isMiniMode) {
    //   window.electronAPI?.enterMiniMode();
    // } else {
    //   window.electronAPI?.enterNormalMode();
    // }
  }, [isMiniMode]);

  const handleOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseFloat(event.target.value);
    setOpacity(newOpacity);
    // if (window.electronAPI) {
    //   window.electronAPI.setOpacity(newOpacity);
    // }
  };

  const toggleMode = () => {
    setIsMiniMode(!isMiniMode);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        window.electronAPI?.sendAudioData(audioBlob);
        audioChunksRef.current = [];
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return { opacity, isMiniMode, handleOpacityChange, toggleMode, isRecording, startRecording, stopRecording };
};