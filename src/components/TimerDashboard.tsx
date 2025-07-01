
import React from 'react';
import TimerCard from './TimerCard';
import { type Timers } from '../types/types';
import { LANES } from '../constants/lanes';

interface TimerDashboardProps {
  timers: Timers;
}

/**
 * 모든 라인의 타이머 카드를 포함하는 대시보드 컴포넌트입니다.
 * @param timers - 모든 라인의 타이머 상태를 담은 객체
 */
const TimerDashboard: React.FC<TimerDashboardProps> = ({ timers }) => {
  return (
    <div className="timer-container">
      {LANES.map(lane => (
        <TimerCard key={lane.name} laneName={lane.name} timerState={timers[lane.name]} />
      ))}
    </div>
  );
};

export default TimerDashboard;
