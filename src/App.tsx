import LaneTimer from './components/LaneTimer';
import VoiceControl from './components/VoiceControl/VoiceControl';

import topIcon from './assets/icon_top.png';
import jungleIcon from './assets/icon_jungle.png';
import midIcon from './assets/icon_mid.png';
import botIcon from './assets/icon_bot.png';
import supportIcon from './assets/icon_sup.png';

const lanes = [
  { name: 'TOP', icon: topIcon },
  { name: 'JGL', icon: jungleIcon },
  { name: 'MID', icon: midIcon },
  { name: 'BOT', icon: botIcon },
  { name: 'SUP', icon: supportIcon },
] as const;

function App() {
  return (
      // 전체 페이지를 중앙 정렬하는 컨테이너
      <div className="min-h-screen w-full flex items-center justify-center p-4 font-sans">

        {/* 가상의 모바일 프레임 */}
        <div className="
        max-w-lg bg-deep-dark
        rounded-[2.5rem] shadow-2xl shadow-black/40
        flex flex-col overflow-hidden space-x-4
      ">
          {/* 다이나믹 아일랜드 시뮬레이션 */}
          <div className="top-4 left-1/2 -translate-x-1/2 h-8 w-32 bg-black rounded-full z-20"></div>

          {/* 스크롤 없는 앱 내부 콘텐츠 영역 */}
          <div className="flex-grow flex flex-col p-8">
            <header className="text-center mt-16 mb-6">
              <h1 className="text-4xl font-bold tracking-wider text-accent-gold [text-shadow:_0_1px_10px_var(--tw-shadow-color)] shadow-accent-gold/30">
                NoFl
              </h1>
              <p className="text-light-gray text-sm mx-6">
                Click on a lane to start the 5-minute timer.
              </p>
            </header>

            <main className=" flex-grow flex flex-col items-center">
              <VoiceControl />
              <div className=" space-y-4">
                {lanes.map((lane) => (
                    <LaneTimer key={lane.name} lane={lane.name} icon={lane.icon} />
                ))}
              </div>
            </main>
          </div>

          {/* 하단 홈 바 시뮬레이션 */}
          <footer className="w-full flex-shrink-0 h-8 flex items-center justify-center pb-4">
            <div className="w-36 h-[5px] bg-white/40 rounded-full"></div>
          </footer>
        </div>

      </div>
  );
}
export default App;