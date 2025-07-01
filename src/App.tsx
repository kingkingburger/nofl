import React from 'react';
import './App.css';
import TimerDashboard from './components/TimerDashboard';
import ControlPanel from './components/ControlPanel';
import { useTimer } from './hooks/useTimer';

/**
 * 노플 애플리케이션의 메인 컴포넌트입니다.
 * 전체 레이아웃을 구성하고, useTimer 훅을 통해 모든 상태와 로직을 관리합니다.
 */
function App() {
  const { timers, toggleRecognition, isRecognizing } = useTimer();

  return (
    <div className="App">
      <header className="App-header">
        <h1>NO FLASH</h1>
        <p>"라인명 노플" 또는 "Lane name no flash"</p>
      </header>
      <main>
        <TimerDashboard timers={timers} />
        <ControlPanel isRecognizing={isRecognizing} onToggle={toggleRecognition} />
      </main>
    </div>
  );
}

export default App;