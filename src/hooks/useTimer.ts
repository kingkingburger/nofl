
import { useReducer, useEffect, useRef } from 'react';
import type { Timers, TimerState } from '../types/types';
import { LANES, FLASH_DURATION, NOTIFICATION_TIME } from '../constants/lanes';

// 상태 변경 로직을 정의하는 Reducer 함수입니다.
const timerReducer = (state: Timers, action: { type: string; payload?: any }): Timers => {
  switch (action.type) {
    case 'START_TIMER':
      return {
        ...state,
        [action.payload.lane]: {
          remainingTime: FLASH_DURATION,
          isActive: true,
          isFlashing: false,
        },
      };
    case 'TICK':
      const newState = { ...state };
      for (const lane in newState) {
        if (newState[lane].isActive && newState[lane].remainingTime > 0) {
          newState[lane].remainingTime -= 1;
          if (newState[lane].remainingTime === NOTIFICATION_TIME) {
            newState[lane].isFlashing = true;
            speak(`${lane} 1분 남았습니다.`);
          }
        } else if (newState[lane].isActive && newState[lane].remainingTime === 0) {
          newState[lane].isActive = false;
          newState[lane].isFlashing = false;
        }
      }
      return newState;
    default:
      return state;
  }
};

// 음성 합성을 위한 유틸리티 함수
const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  speechSynthesis.speak(utterance);
};

/**
 * 노플 타이머의 모든 로직(상태 관리, 음성 인식, 타이머 생명주기)을 관리하는 커스텀 훅입니다.
 * @returns 타이머 상태, 음성 인식 제어 함수, 현재 인식 상태
 */
export const useTimer = () => {
  const initialState: Timers = LANES.reduce((acc, lane) => {
    acc[lane.name] = { remainingTime: FLASH_DURATION, isActive: false, isFlashing: false };
    return acc;
  }, {} as Timers);

  const [timers, dispatch] = useReducer(timerReducer, initialState);
  const [isRecognizing, setIsRecognizing] = useReducer((state) => !state, false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const annyang = (window as any).annyang;
    if (!annyang) {
      console.error("Annyang 라이브러리를 찾을 수 없습니다.");
      return;
    }

    const commands = LANES.reduce((acc, lane) => {
      acc[`*term ${lane.kor} 노플`] = () => dispatch({ type: 'START_TIMER', payload: { lane: lane.name } });
      acc[`*term ${lane.eng} no flash`] = () => dispatch({ type: 'START_TIMER', payload: { lane: lane.name } });
      return acc;
    }, {} as Record<string, () => void>);

    annyang.addCommands(commands);
    recognitionRef.current = annyang;

    annyang.addCallback('start', () => setIsRecognizing());
    annyang.addCallback('end', () => isRecognizing && setIsRecognizing());

    return () => annyang.abort();
  }, [isRecognizing]);

  useEffect(() => {
    const timerId = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(timerId);
  }, []);

  const toggleRecognition = () => {
    if (recognitionRef.current) {
      isRecognizing ? recognitionRef.current.abort() : recognitionRef.current.start({ autoRestart: true, continuous: false });
    }
  };

  return { timers, toggleRecognition, isRecognizing };
};
