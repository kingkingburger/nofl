import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with the given initial time', () => {
    const { result } = renderHook(() => useTimer(300));
    expect(result.current.time).toBe(300);
    expect(result.current.isActive).toBe(false);
  });

  it('should start the timer', () => {
    const { result } = renderHook(() => useTimer(300));
    act(() => {
      result.current.startTimer();
    });
    expect(result.current.isActive).toBe(true);
  });

  it('should decrease the time every second when the timer is active', () => {
    const { result } = renderHook(() => useTimer(300));
    act(() => {
      result.current.startTimer();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.time).toBe(299);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.time).toBe(297);
  });

  it('should not decrease the time below zero', () => {
    const { result } = renderHook(() => useTimer(1));
    act(() => {
      result.current.startTimer();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.time).toBe(0);
  });

  it('should stop the timer when time reaches zero', () => {
    const { result } = renderHook(() => useTimer(1));
    act(() => {
      result.current.startTimer();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.isActive).toBe(false);
  });

  it('should reset the timer to the initial time', () => {
    const { result } = renderHook(() => useTimer(300));
    act(() => {
      result.current.startTimer();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    act(() => {
      result.current.resetTimer();
    });
    expect(result.current.time).toBe(300);
    expect(result.current.isActive).toBe(false);
  });
});
