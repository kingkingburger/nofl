import React, { useState, useEffect } from 'react';
import TimerDashboard from './components/TimerDashboard';
import ControlPanel from './components/ControlPanel';
import { useTimer } from './hooks/useTimer';
import { FaSun, FaWindowMinimize, FaWindowMaximize } from 'react-icons/fa';

/**
 * 노플 애플리케이션의 메인 컴포넌트입니다.
 * 전체 레이아웃을 구성하고, useTimer 훅을 통해 모든 상태와 로직을 관리합니다.
 */
function App() {
  const { timers, toggleRecognition, isRecognizing } = useTimer();
  const [opacity, setOpacity] = useState(1);
  const [isMiniMode, setIsMiniMode] = useState(true);

  useEffect(() => {
    if (isMiniMode) {
      window.electronAPI?.enterMiniMode();
    } else {
      window.electronAPI?.enterNormalMode();
    }
  }, [isMiniMode]);

  const handleOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseFloat(event.target.value);
    setOpacity(newOpacity);
    if (window.electronAPI) {
      window.electronAPI.setOpacity(newOpacity);
    }
  };

  const toggleMode = () => {
    setIsMiniMode(!isMiniMode);
  };

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen relative z-0 animate-fade-in ${isMiniMode ? 'p-2 bg-transparent mini-mode' : 'p-8 bg-gray-900 normal-mode'}`}>
      {/* 창을 드래그할 수 있는 영역 */}
      <div className="fixed top-0 left-0 w-full h-8 -webkit-app-region-drag z-50"></div>

      {!isMiniMode && (
        <header className="mb-16 text-center relative z-10">
          <h1 className="text-6xl font-extrabold text-accent tracking-wider mb-2 drop-shadow-lg leading-tight">
            NO FLASH
          </h1>
          <p className="text-lg text-secondary-text opacity-90">
            "라인명 노플" 또는 "Lane name no flash"
          </p>
        </header>
      )}

      <main className="w-full max-w-6xl relative z-10">
        <TimerDashboard timers={timers} />
        <ControlPanel isRecognizing={isRecognizing} onToggle={toggleRecognition} />
      </main>

      {!isMiniMode && (
        <footer className="fixed bottom-5 left-1/2 -translate-x-1/2 w-80 z-40">
          <div className="flex items-center gap-4 bg-dark-surface bg-opacity-80 p-3 rounded-full shadow-3xl backdrop-blur-md border border-gray-700">
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
      )}

      <button 
        onClick={toggleMode} 
        className="fixed top-2 right-2 z-50 p-2 bg-gray-700 rounded-full text-white hover:bg-gray-600 transition-colors"
        title={isMiniMode ? "일반 모드로 전환" : "미니 모드로 전환"}
      >
        {isMiniMode ? <FaWindowMaximize /> : <FaWindowMinimize />}
      </button>
    </div>
  );
}

export default App;