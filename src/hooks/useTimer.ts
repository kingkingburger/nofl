import { useReducer, useEffect, useRef, useState } from 'react';
import type { Timers } from '../types/types';
import { LANES, FLASH_DURATION, NOTIFICATION_TIME } from '../constants/lanes';

// 상태 변경 로직을 정의하는 Reducer 함수 (수정 없음)
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

// 음성 합성을 위한 유틸리티 함수 (수정 없음)
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
  // useReducer 대신 useState를 사용하여 코드를 간결하게 만듭니다.
  const [isRecognizing, setIsRecognizing] = useState(false);
  const recognitionRef = useRef<any>(null);

  // annyang 설정은 한 번만 실행되도록 의존성 배열을 []로 변경합니다.
  useEffect(() => {
    const annyang = (window as any).annyang;
    console.log('annyang 객체 확인:', annyang);
    if (!annyang) {
      console.error("Annyang 라이브러리를 찾을 수 없습니다.");
      return;
    }

    const commands = LANES.reduce((acc, lane) => {
      // '탑 노플', 'top no flash' 등의 명령어를 정의합니다.
      acc[`*term ${lane.kor} 노플`] = () => dispatch({ type: 'START_TIMER', payload: { lane: lane.name } });
      acc[`*term ${lane.eng} no flash`] = () => dispatch({ type: 'START_TIMER', payload: { lane: lane.name } });
      return acc;
    }, {} as Record<string, () => void>);

    annyang.addCommands(commands);

    // annyang.addCallback을 한 곳에 모아 관리합니다.
    annyang.addCallback("result", (phrases: string[]) => {
      console.log("[음성 인식 결과]", phrases);
      // 인식 후 자동으로 중지되도록 설정했다면, 여기서 다시 시작하거나 상태를 관리할 수 있습니다.
    });

    annyang.addCallback('start', () => {
        console.log('음성 인식이 시작되었습니다.');
        setIsRecognizing(true);
    });

    // annyang.end 콜백은 인식이 타임아웃되거나 abort()로 중지될 때 호출됩니다.
    annyang.addCallback('end', () => {
        console.log('음성 인식이 종료되었습니다.');
        setIsRecognizing(false);
    });

    recognitionRef.current = annyang;

    // 컴포넌트 언마운트 시 annyang 리소스를 정리합니다.
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        // 필요하다면 콜백과 커맨드도 제거합니다.
        recognitionRef.current.removeCommands();
        recognitionRef.current.removeCallback();
      }
    };
  }, []); // 의존성 배열을 빈 값으로 설정하여 최초 렌더링 시에만 실행

  // 타이머 로직 (수정 없음)
  useEffect(() => {
    const timerId = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(timerId);
  }, []);

  const toggleRecognition = () => {
    if (recognitionRef.current) {
        // isRecognizing 상태를 직접 확인하여 start 또는 abort를 호출합니다.
        if (isRecognizing) {
            recognitionRef.current.abort();
        } else {
            // autoRestart: true - 음성 인식이 멈추면 자동으로 재시작
            // continuous: false - 한 번의 구문만 인식하고 중지
            recognitionRef.current.start({ autoRestart: true, continuous: false });
        }
    }
  };

  return { timers, toggleRecognition, isRecognizing };
};