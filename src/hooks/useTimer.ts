import { useReducer, useEffect, useRef } from "react";
import * as annyang from "annyang";
import type { Timers, Command } from "../types/types";
import { LANES, FLASH_DURATION, NOTIFICATION_TIME } from "../constants/lanes";

// 상태 변경 로직을 정의하는 Reducer 함수입니다.
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

// 음성 합성을 위한 유틸리티 함수
const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  speechSynthesis.speak(utterance);
};

/**
 * 노플 타이머의 모든 로직(상태 관리, 음성 인식, 타이머 생명주기)을 관리하는 커스텀 훅입니다.
 * @returns 타이머 상태, 음성 인식 제어 함수, 현재 인식 상태
 */
export const useTimer = (commands: Command[]) => {
  const initialState: Timers = LANES.reduce((acc, lane) => {
    acc[lane.name] = {
      remainingTime: FLASH_DURATION,
      isActive: false,
      isFlashing: false,
    };
    return acc;
  }, {} as Timers);

  const [timers, dispatch] = useReducer(timerReducer, initialState);
  const [isRecognizing, setIsRecognizing] = useReducer(
    (state) => !state,
    false
  );
  const recognitionRef = useRef<typeof annyang | null>(null);

  useEffect(() => {
    // annyang.debug(true); // 모든 내부 로그를 콘솔로 확인
    if (!annyang) {
      console.error("Annyang 라이브러리를 찾을 수 없습니다.");
      return;
    }

    // ‼️ 음성 인식 결과를 콘솔에 출력
    annyang.addCallback("result", (phrases: string[]) => {
      /* 예: ["top no flash", "잡 노플래시"] */
      console.log("[음성 인식 결과]", phrases);
    });

    // 필요하면 최종 매칭 결과만 보고 싶을 때
    annyang.addCallback(
      "resultMatch",
      (userSaid: string, commandText: string) => {
        console.log(`[매칭 성공] 사용자가 말한 문장: ${userSaid}`);
        console.log(`[매칭된 명령] ${commandText}`);
      }
    );

    const annyangCommands = commands.reduce((acc, command) => {
      acc[command.phrase] = () => {
        dispatch({ type: "START_TIMER", payload: { lane: command.lane } });
      };
      return acc;
    }, {} as Record<string, () => void>);

    annyang.addCommands(annyangCommands);
    recognitionRef.current = annyang;

    return () => annyang.abort();
  }, []);

  useEffect(() => {
    const timerId = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(timerId);
  }, []);

  const toggleRecognition = () => {
    if (recognitionRef.current) {
      if (isRecognizing) {
        recognitionRef.current.abort();
      } else {
        recognitionRef.current.start({
          autoRestart: true,
          continuous: false,
        });
      }
      setIsRecognizing();
    }
  };

  return { timers, toggleRecognition, isRecognizing };
};
