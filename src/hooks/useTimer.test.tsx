import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';
import { FLASH_DURATION } from '../constants/lanes';

// annyang과 speechSynthesis를 모의(mock) 처리합니다.
const mockAnnyang = {
  addCommands: vi.fn(),
  addCallback: vi.fn(),
  start: vi.fn(),
  abort: vi.fn(),
};

const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
};

// 전역 window 객체에 모의 객체를 할당합니다.
vi.stubGlobal('annyang', mockAnnyang);
vi.stubGlobal('speechSynthesis', mockSpeechSynthesis);

describe('useTimer 훅', () => {
  beforeEach(() => {
    // 각 테스트 전에 annyang과 관련된 함수들의 호출 기록을 초기화합니다.
    vi.clearAllMocks();
    // 타이머 관련 시간 함수를 모의 처리합니다.
    vi.useFakeTimers();
  });

  afterEach(() => {
    // 테스트가 끝나면 실제 타이머로 복원합니다.
    vi.useRealTimers();
  });

  it('초기 상태가 올바르게 설정되어야 합니다.', () => {
    const { result } = renderHook(() => useTimer());

    // 모든 라인의 타이머가 비활성화 상태인지 확인합니다.
    Object.values(result.current.timers).forEach(timer => {
      expect(timer.isActive).toBe(false);
      expect(timer.remainingTime).toBe(FLASH_DURATION);
    });
    expect(result.current.isRecognizing).toBe(false);
  });

  it('음성 인식을 시작하고 중지할 수 있어야 합니다.', () => {
    const { result, rerender } = renderHook(() => useTimer());

    // 초기 상태에서는 annyang.start가 호출되지 않아야 합니다.
    expect(mockAnnyang.start).not.toHaveBeenCalled();

    // 음성 인식을 토글합니다.
    act(() => {
      result.current.toggleRecognition();
    });

    // isRecognizing 상태가 true로 변경되었는지 확인하고, annyang.start가 호출되었는지 확인합니다.
    rerender();
    expect(result.current.isRecognizing).toBe(true);
    expect(mockAnnyang.start).toHaveBeenCalledTimes(1);

    // 음성 인식을 다시 토글합니다.
    act(() => {
      result.current.toggleRecognition();
    });

    // isRecognizing 상태가 false로 변경되었는지 확인하고, annyang.abort가 호출되었는지 확인합니다.
    rerender();
    expect(result.current.isRecognizing).toBe(false);
    expect(mockAnnyang.abort).toHaveBeenCalledTimes(1);
  });
});
