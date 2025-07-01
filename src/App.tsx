
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const lanes = [
  { name: '탑', kor: '탑', eng: 'top' },
  { name: '정글', kor: '정글', eng: 'jungle' },
  { name: '미드', kor: '미드', eng: 'mid' },
  { name: '원딜', kor: '원딜', eng: 'bot' },
  { name: '서폿', kor: '서폿', eng: 'support' },
];

const FLASH_DURATION = 300; // 5분 = 300초

function App() {
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [isActive, setIsActive] = useState<Record<string, boolean>>({});
  const [isFlashing, setIsFlashing] = useState<Record<string, boolean>>({});
  const [isRecognizing, setIsRecognizing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const annyang = (window as any).annyang;
    if (annyang) {
      const commands = {};
      lanes.forEach(lane => {
        commands[`*term ${lane.kor} 노플`] = () => startTimer(lane.name);
        commands[`*term ${lane.eng} no flash`] = () => startTimer(lane.name);
      });

      annyang.addCommands(commands);
      recognitionRef.current = annyang;
    } else {
      console.error("Annyang not found. Please include the annyang library.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => {
        const newTimers = { ...prevTimers };
        for (const lane in newTimers) {
          if (newTimers[lane] > 0) {
            newTimers[lane]--;
            if (newTimers[lane] === 60) {
              speak(`${lane} 1분 남았습니다.`);
              setIsFlashing(prev => ({ ...prev, [lane]: true }));
            }
          } else {
            setIsActive(prev => ({ ...prev, [lane]: false }));
            setIsFlashing(prev => ({ ...prev, [lane]: false }));
          }
        }
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const startTimer = (lane: string) => {
    setTimers(prev => ({ ...prev, [lane]: FLASH_DURATION }));
    setIsActive(prev => ({ ...prev, [lane]: true }));
    setIsFlashing(prev => ({ ...prev, [lane]: false }));
    speak(`${lane} 플래시 타이머 시작`);
  };

  const toggleRecognition = () => {
    if (recognitionRef.current) {
      if (isRecognizing) {
        recognitionRef.current.abort();
      } else {
        recognitionRef.current.start({ autoRestart: true, continuous: false });
      }
      setIsRecognizing(!isRecognizing);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    speechSynthesis.speak(utterance);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>노플</h1>
        <p>마이크에 "라인명 노플" 이라고 말하면 타이머가 시작됩니다.</p>
      </header>
      <div className="timer-container">
        {lanes.map(({ name }) => (
          <div key={name} className={`lane ${isActive[name] ? 'active' : ''} ${isFlashing[name] ? 'flashing' : ''}`}>
            <h2>{name}</h2>
            <div className="timer">{formatTime(timers[name] || FLASH_DURATION)}</div>
            <div className="status">{isActive[name] ? '활성' : '대기중'}</div>
          </div>
        ))}
      </div>
      <button onClick={toggleRecognition} className="control-button">
        {isRecognizing ? '음성 인식 중지' : '음성 인식 시작'}
      </button>
    </div>
  );
}

export default App;
