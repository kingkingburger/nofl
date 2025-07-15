import { useEffect, useReducer, useCallback } from 'react';
import type { Timers } from '../types/types';
import { FLASH_DURATION, LANES, NOTIFICATION_TIME } from '../constants/lanes';

// 음성 합성을 위한 유틸리티 함수
const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  const koreanVoice = voices.find(voice => voice.lang === 'ko-KR');
  if (koreanVoice) {
    utterance.voice = koreanVoice;
  }
  utterance.lang = "ko-KR";
  speechSynthesis.speak(utterance);
};

// 상태 변경 로직을 정의하는 Reducer 함수
const timerReducer = (
  state: Timers,
  action: { type: string; payload?: any }
): Timers => {
  switch (action.type) {
    case "START_TIMER":
      return {
        ...state,
        [action.payload.lane]: {
          remainingTime: FLASH_DURATION,
          isActive: true,
          isFlashing: false,
        },
      };
    case "TICK":
      const newState = { ...state };
      for (const lane in newState) {
        if (newState[lane].isActive && newState[lane].remainingTime > 0) {
          newState[lane].remainingTime -= 1;
          if (newState[lane].remainingTime === NOTIFICATION_TIME) {
            newState[lane].isFlashing = true;
            speak(`${lane} 1분 남았습니다.`);
          }
        } else if (
          newState[lane].isActive &&
          newState[lane].remainingTime === 0
        ) {
          newState[lane].isActive = false;
          newState[lane].isFlashing = false;
        }
      }
      return newState;
    default:
      return state;
  }
};

/**
 * 노플 타이머의 모든 로직(상태 관리, 음성 명령 처리, 타이머 생명주기)을 관리하는 커스텀 훅입니다.
 * @returns 타이머 상태, 음성 명령 처리 함수
 */
export const useTimer = () => {
  const initialState: Timers = LANES.reduce((acc, lane) => {
    acc[lane.name] = {
      remainingTime: FLASH_DURATION,
      isActive: false,
      isFlashing: false,
    };
    return acc;
  }, {} as Timers);

  const [timers, dispatch] = useReducer(timerReducer, initialState);

  const processCommand = useCallback((command: string) => {
    console.log("Received command:", command);
    const lowerCaseCommand = command.toLowerCase().replace(/\s+/g, '');

    LANES.forEach(lane => {
      const keywords = [lane.name.toLowerCase(), ...lane.aliases];
      if (keywords.some(keyword => lowerCaseCommand.includes(keyword)) && (lowerCaseCommand.includes('noflash') || lowerCaseCommand.includes('노플'))) {
        dispatch({ type: "START_TIMER", payload: { lane: lane.name } });
        speak(`${lane.name} 타이머 시작`);
      }
    });
  }, []);

  useEffect(() => {
    const timerId = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(timerId);
  }, []);

  return { timers, processCommand };
};