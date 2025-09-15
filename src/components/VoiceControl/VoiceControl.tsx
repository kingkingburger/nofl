import React from 'react';
import { useWhisper } from '../../hooks/useWhisper';
import styles from './VoiceControl.module.css';

const VoiceControl: React.FC = () => {
  const {
    isModelLoading,
    isReady,
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
  } = useWhisper();

  const getStatusMessage = () => {
    if (error) return `Error: ${error}`;
    if (isModelLoading) return 'Whisper 모델을 로딩중입니다...';
    if (!isReady) return 'Whisper를 준비중입니다...';
    if (isRecording) return '음성 입력 듣는 중...';
    return '버튼을 누르고 말하세요.';
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>음성 인식 테스트</h2>
      <p className={styles.status}>{getStatusMessage()}</p>
      <div className={styles.buttonContainer}>
        <button
          onClick={startRecording}
          disabled={!isReady || isRecording}
          className={styles.button}
        >
          녹음 시작
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className={`${styles.button} ${styles.stopButton}`}>
          녹음 중지
        </button>
      </div>
      {transcript && (
        <div className={styles.transcriptContainer}>
          <h3 className={styles.transcriptTitle}>변환된 텍스트:</h3>
          <p className={styles.transcriptText}>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceControl;
