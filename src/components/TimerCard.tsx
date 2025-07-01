
import React from 'react';
import { type TimerState } from '../types/types';

interface TimerCardProps {
  laneName: string;
  timerState: TimerState;
}

/**
 * 개별 라인의 타이머 정보를 시각적으로 표시하는 카드 컴포넌트입니다.
 * @param laneName - 표시할 라인의 이름 (예: "탑")
 * @param timerState - 해당 라인의 현재 타이머 상태 객체
 */
const TimerCard: React.FC<TimerCardProps> = ({ laneName, timerState }) => {
  const { remainingTime, isActive, isFlashing } = timerState;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const cardClasses = `
    lane
    ${isActive ? 'active' : ''}
    ${isFlashing ? 'flashing' : ''}
  `;

  return (
    <div className={cardClasses}>
      <h2 className="lane-name">{laneName}</h2>
      <div className="timer-display">{formatTime(remainingTime)}</div>
      <div className="status-text">{isActive ? '활성' : '대기중'}</div>
    </div>
  );
};

export default TimerCard;
