import React, { useImperativeHandle, forwardRef } from 'react';
import { useTimer } from '../hooks/useTimer';

/**
 * @description Formats a given time in seconds into a MM:SS string format.
 * This utility is essential for displaying the countdown in a user-friendly way.
 * @param {number} time The time in seconds.
 * @returns {string} The formatted time string (e.g., "05:00").
 */
const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');
  return `${paddedMinutes}:${paddedSeconds}`;
};

/**
 * @description Interface for the Timer component's props.
 */
interface TimerProps {
  lane: string;
  initialTime: number;
}

/**
 * @description Defines the shape of the ref that will be exposed by the Timer component.
 * This allows parent components to call these functions directly.
 */
export interface TimerRef {
  startTimer: () => void;
  resetTimer: () => void;
}

/**
 * @description A component that displays a countdown timer for a specific lane.
 * It is wrapped in `forwardRef` to allow parent components to control it via a ref.
 */
export const Timer = forwardRef<TimerRef, TimerProps>(({ lane, initialTime }, ref) => {
  const { time, isActive, startTimer, resetTimer } = useTimer(initialTime);

  // `useImperativeHandle` exposes specific functions to the parent component through the ref.
  // This is a controlled way to allow parent-child communication without passing down props for everything.
  useImperativeHandle(ref, () => ({
    startTimer,
    resetTimer,
  }));

  return (
    <div
      onClick={isActive ? resetTimer : startTimer}
      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-lg text-white font-mono cursor-pointer"
    >
      <span className="text-xl font-bold text-yellow-400">{lane}</span>
      <span className="text-2xl font-semibold">{formatTime(time)}</span>
    </div>
  );
});