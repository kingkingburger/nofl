import { useState, useEffect, useRef } from 'react';

const FLASH_COOLDOWN = 300; // 5분 = 300초

/**
 * 지정된 시간(초) 동안 카운트다운하는 타이머 훅.
 * @returns {object} 타이머 상태와 제어 함수를 포함하는 객체
 * - timeLeft: 남은 시간 (초)
 * - isActive: 타이머 활성화 여부
 * - startTimer: 타이머 시작 함수
 * - formatTime: 시간을 mm:ss 형식의 문자열로 변환하는 함수
 * - progress: 타이머 진행률 (0-100)
 */
export const useTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(FLASH_COOLDOWN);
  const [isActive, setIsActive] = useState<boolean>(false);

  // 브라우저와 Node.js 환경 모두에서 호환되는 타입 사용
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // #1: 타이머의 생명주기(생성 및 제거)를 관리하는 useEffect
  useEffect(() => {
    // 타이머가 비활성 상태이면 아무것도 하지 않음
    if (!isActive) {
      return;
    }

    // 1초마다 timeLeft를 1씩 감소시키는 인터벌 설정
    intervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // 클린업 함수: 컴포넌트가 언마운트되거나 isActive가 false가 될 때 인터벌을 정리함
    // 이것이 인터벌을 정리하는 유일한 경로가 되도록 설계하여 코드의 예측 가능성을 높임
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]); // 이 useEffect는 'isActive' 상태에만 의존

  // #2: 남은 시간이 0이 되었을 때의 상태 변화를 처리하는 useEffect
  useEffect(() => {
    // 남은 시간이 0 이하이고 타이머가 활성 상태일 때
    if (timeLeft <= 0 && isActive) {
      setIsActive(false); // 타이머를 비활성화
      setTimeLeft(FLASH_COOLDOWN); // 다음 시작을 위해 시간을 초기값으로 리셋
    }
  }, [timeLeft, isActive]);

  /** 타이머를 시작합니다. 이미 실행 중인 경우 아무 작업도 수행하지 않습니다. */
  const startTimer = () => {
    if (!isActive) {
      // 시작 시점에 시간을 초기화하는 것이 더 명확한 흐름을 만듦
      setTimeLeft(FLASH_COOLDOWN);
      setIsActive(true);
    }
  };

  // 타이머가 활성화된 경우에만 진행률을 계산
  const progress = isActive
      ? ((FLASH_COOLDOWN - timeLeft) / FLASH_COOLDOWN) * 100
      : 0;

  return { timeLeft, isActive, startTimer, progress };
};