import { useState, useEffect, useRef } from 'react';

const FLASH_COOLDOWN = 300; // 5분 = 300초

export const useTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(FLASH_COOLDOWN);
  const [isActive, setIsActive] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);
            setIsActive(false);
            return FLASH_COOLDOWN;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const startTimer = () => {
    if (!isActive) {
      setTimeLeft(FLASH_COOLDOWN);
      setIsActive(true);
    }
  };


  const progress = isActive ? ((FLASH_COOLDOWN - timeLeft) / FLASH_COOLDOWN) * 100 : 0;

  return { timeLeft, isActive, startTimer,  progress };
};