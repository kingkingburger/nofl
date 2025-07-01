
import React from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

interface ControlPanelProps {
  isRecognizing: boolean;
  onToggle: () => void;
}

/**
 * 음성 인식 시작/중지 기능을 제어하는 버튼이 포함된 패널입니다.
 * @param isRecognizing - 현재 음성 인식이 활성화되어 있는지 여부
 * @param onToggle - 버튼 클릭 시 호출될 함수
 */
const ControlPanel: React.FC<ControlPanelProps> = ({ isRecognizing, onToggle }) => {
  return (
    <div className="flex justify-center">
      <button
        onClick={onToggle}
        className={`
          flex items-center gap-3 px-8 py-4 rounded-full text-lg font-semibold cursor-pointer
          transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg
          ${isRecognizing ? 'bg-warning text-dark-bg' : 'bg-accent text-dark-bg'}
        `}
      >
        {isRecognizing ? <FaMicrophoneSlash className="text-xl" /> : <FaMicrophone className="text-xl" />}
        <span className="leading-none">
          {isRecognizing ? '음성 인식 중지' : '음성 인식 시작'}
        </span>
      </button>
    </div>
  );
};

export default ControlPanel;
