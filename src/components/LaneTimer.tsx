import { useTimer } from '../hooks/useTimer';
import {formatTime} from "../utils/time/formatTime.ts";

interface LaneTimerProps {
  lane: 'TOP' | 'JGL' | 'MID' | 'BOT' | 'SUP';
  icon: string;
}

const LaneTimer = ({ lane, icon }: LaneTimerProps) => {
  const { timeLeft, isActive, startTimer, progress } = useTimer(); // 5분 = 300초

  const containerClasses = `
    relative w-full h-24 rounded-2xl flex items-center p-4
    overflow-hidden cursor-pointer select-none
    transition-all duration-300 ease-in-out
    transform hover:scale-[1.03]
    ${isActive
      ? 'bg-subtle-gray shadow-gold-glow'
      : 'bg-subtle-gray/60 hover:bg-subtle-gray'
  }
  `;

  return (
      <div className={containerClasses} onClick={startTimer}>
        {/* 배경 진행률 표시 */}
        <div
            className="absolute top-0 left-0 h-full bg-accent-gold/20"
            style={{ width: `${progress}%`, transition: 'width 0.5s cubic-bezier(0.25, 1, 0.5, 1)' }}
        />

        {/* 아이콘 */}
        <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
          <img
              src={icon}
              alt={`${lane} icon`}
              className={`w-10 h-10 transition-all duration-500 ${isActive ? 'grayscale-0 opacity-100 scale-110' : 'grayscale opacity-60'}`}
          />
        </div>

        {/* 라인 이름 및 타이머 */}
        <div className="ml-4 flex-grow z-10">
          <p className={`text-xl font-bold transition-colors duration-300 ${isActive ? 'text-white' : 'text-light-gray/80'}`}>
            {lane}
          </p>
          <p className={`text-4xl font-sans font-semibold transition-all duration-300 ${isActive ? 'text-accent-gold' : 'text-white/70'}`}>
            {isActive ? formatTime(timeLeft) : 'READY'}
          </p>
        </div>
      </div>
  );
};

export default LaneTimer;