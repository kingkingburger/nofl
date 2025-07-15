import React from 'react';
import type { TimerState } from '../types/types';
import { useTranslation } from 'react-i18next';

interface TimerCardProps {
  laneName: string;
  timerState: TimerState;
}

/**
 * 다크 배경(#121212)과 포인트 텍스트(#03DAC6)를 적용한 모던 카드입니다.
 */
const TimerCard: React.FC<TimerCardProps> = ({ laneName, timerState }) => {
  const { t } = useTranslation();
  const { remainingTime, isActive, isFlashing } = timerState;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const containerClasses = `
    relative p-2 rounded-lg overflow-hidden
    border border-[#03DAC6]
    shadow-md
    transition-transform duration-300 ease-in-out
    hover:scale-105
    w-[88px] h-[88px]
    flex flex-col items-center justify-center
    ${isActive ? 'ring-2 ring-[#03DAC6] animate-pulse' : ''}
    ${isFlashing ? 'animate-ping' : ''}
  `.trim();

  return (
    <div className={containerClasses}>
      {/* 글래스모피즘 블러 레이어 */}
      <div className="absolute inset-0 bg-opacity-5 backdrop-blur-sm" />
      <div className="relative flex flex-col items-center space-y-1">
        <h2 className="text-sm font-semibold">{laneName}</h2>
        <div className="text-2xl font-bold tracking-wide drop-shadow-md">
          {formatTime(remainingTime)}
        </div>
        <span
          className={`
            px-2 py-0.5 rounded-full text-xs font-medium
            ${isActive 
              ? ' bg-opacity-20' 
              : ' bg-opacity-10'}
          `}
        >
          {isActive ? t('active') : t('inactive')}
        </span>
      </div>
    </div>
  );
};

export default TimerCard;
