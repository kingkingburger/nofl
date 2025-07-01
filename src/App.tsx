import React, { useState } from 'react';
import TimerDashboard from './components/TimerDashboard';
import ControlPanel from './components/ControlPanel';
import { useTimer } from './hooks/useTimer';
import { FaSun } from 'react-icons/fa';

/**
 * 노플 애플리케이션의 메인 컴포넌트입니다.
 * 전체 레이아웃을 구성하고, useTimer 훅을 통해 모든 상태와 로직을 관리합니다.
 */
function App() {
  const { timers, toggleRecognition, isRecognizing } = useTimer();
  const [opacity, setOpacity] = useState(1);

  const handleOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseFloat(event.target.value);
    setOpacity(newOpacity);
    // preload를 통해 노출된 setOpacity 함수 호출
    if (window.electronAPI) {
      window.electronAPI.setOpacity(newOpacity);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg text-primary-text font-sans p-8">
      {/* 창을 드래그할 수 있는 영역 */}
      <div className="fixed top-0 left-0 w-full h-8 -webkit-app-region-drag"></div>

      <header className="mb-16 text-center">
        <h1 className="text-5xl font-bold text-accent tracking-wider mb-2">NO FLASH</h1>
        <p className="text-lg text-secondary-text">"라인명 노플" 또는 "Lane name no flash"</p>
      </header>
      <main className="w-full max-w-5xl">
        <TimerDashboard timers={timers} />
        <ControlPanel isRecognizing={isRecognizing} onToggle={toggleRecognition} />
      </main>

      {/* 투명도 조절 슬라이더 */}
      <footer className="fixed bottom-5 left-1/2 -translate-x-1/2 w-72">
        <div className="flex items-center gap-4 bg-dark-surface bg-opacity-50 p-2 rounded-full backdrop-blur-sm">
          <FaSun className="text-xl text-secondary-text" />
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={handleOpacityChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </footer>
    </div>
  );
}

export default App;