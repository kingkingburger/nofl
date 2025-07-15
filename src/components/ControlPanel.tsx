import React from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface ControlPanelProps {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
}

/**
 * 음성 인식 시작/중지 기능을 제어하는 버튼이 포함된 패널입니다.
 * @param isRecording - 현재 음성 녹음이 활성화되어 있는지 여부
 * @param startRecording - 녹음 시작 함수
 * @param stopRecording - 녹음 중지 함수
 */
const ControlPanel: React.FC<ControlPanelProps> = ({ isRecording, startRecording, stopRecording }) => {
  const { t } = useTranslation();

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={handleToggle}
        className={`
          flex items-center gap-3 px-8 py-4 rounded-full text-lg font-semibold cursor-pointer
          transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg
          ${isRecording ? 'bg-warning text-dark-bg' : 'bg-accent text-dark-bg'}
        `}
      >
        {isRecording ? <FaMicrophoneSlash className="text-xl" /> : <FaMicrophone className="text-xl" />}
        <span className="leading-none">
          {isRecording ? t('recognizing_stop') : t('recognizing_start')}
        </span>
      </button>
    </div>
  );
};

export default ControlPanel;