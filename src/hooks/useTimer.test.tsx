import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';
import { FLASH_DURATION } from '../constants/lanes';

// speechSynthesis를 모의(mock) 처리합니다.
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn().mockReturnValue([]),
};

// 전역 window 객체에 모의 객체를 할당합니다.
vi.stubGlobal('speechSynthesis', mockSpeechSynthesis);

describe('useTimer 훅', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태가 올바르게 설정되어야 합니다.', () => {
    const { result } = renderHook(() => useTimer());

    Object.values(result.current.timers).forEach(timer => {
      expect(timer.isActive).toBe(false);
      expect(timer.remainingTime).toBe(FLASH_DURATION);
    });
  });

  it('processCommand 함수가 음성 명령을 올바르게 처리해야 합니다.', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.processCommand('탑 노플');
    });

    expect(result.current.timers['탑'].isActive).toBe(true);
    expect(result.current.timers['탑'].remainingTime).toBe(FLASH_DURATION);
    expect(mockSpeechSynthesis.speak).toHaveBeenCalledWith('탑 타이머 시작');
  });

  it('시간이 지남에 따라 타이머가 감소해야 합니다.', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.processCommand('미드 노플');
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timers['미드'].remainingTime).toBe(FLASH_DURATION - 1);
  });
});