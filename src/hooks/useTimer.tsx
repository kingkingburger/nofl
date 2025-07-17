import { useState, useEffect, useCallback } from 'react';

/**
 * @description A custom hook to manage a countdown timer.
 * This hook provides functionalities to start, reset, and track the timer's state.
 * It's designed to be a reusable and self-contained piece of logic for any countdown feature.
 *
 * @param {number} initialTime The initial time for the countdown in seconds.
 * @returns {{time: number, isActive: boolean, startTimer: () => void, resetTimer: () => void}}
 * An object containing the current time, the timer's active state,
 * and functions to control the timer.
 */
export const useTimer = (initialTime: number) => {
  // State to store the remaining time.
  // It is initialized with the value passed as an argument.
  const [time, setTime] = useState(initialTime);

  // State to determine if the timer is currently running.
  const [isActive, setIsActive] = useState(false);

  /**
   * @description Effect to handle the countdown logic.
   * This `useEffect` runs whenever `isActive` or `time` changes.
   * It sets up an interval that decrements the time every second if the timer is active
   * and the time has not yet reached zero.
   */
  useEffect(() => {
    let interval: number | undefined;

    // The timer only runs if it's active and there's time left.
    if (isActive && time > 0) {
      interval = window.setInterval(() => {
        setTime((prevTime) => Math.max(0, prevTime - 1));
      }, 1000);
    } else if (time === 0) {
      // When the time runs out, the timer is automatically stopped.
      setIsActive(false);
    }

    // Cleanup function: This is crucial for performance and preventing memory leaks.
    // It clears the interval when the component unmounts or before the effect runs again.
    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [time, isActive]);

  /**
   * @description Starts the timer.
   * This function is wrapped in `useCallback` to ensure it doesn't get recreated on every render,
   * which is a performance optimization.
   */
  const startTimer = useCallback(() => {
    setIsActive(true);
  }, []);

  /**
   * @description Resets the timer to its initial state.
   * It stops the timer and restores the time to its initial value.
   * Wrapped in `useCallback` for performance optimization.
   */
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTime(initialTime);
  }, [initialTime]);

  // Exposing the state and control functions to the component using this hook.
  return { time, isActive, startTimer, resetTimer };
};
