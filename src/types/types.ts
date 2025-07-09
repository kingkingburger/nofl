
/**
 * 개별 라인의 정보를 나타내는 타입입니다.
 */
export interface Lane {
  name: string;
  kor: string;
  eng: string;
}

/**
 * 각 타이머의 상태를 나타내는 타입입니다.
 */
export interface TimerState {
  remainingTime: number;
  isActive: boolean;
  isFlashing: boolean;
}

/**
 * 모든 라인의 타이머 상태를 포함하는 객체의 타입입니다.
 * 키는 라인의 이름(string)이며, 값은 해당 라인의 TimerState 입니다.
 */
export type Timers = Record<string, TimerState>;

/**
 * 음성 명령어를 나타내는 타입입니다.
 */
export interface Command {
  id: string;
  phrase: string;
  lane: string;
}


/**
 * Electron의 preload 스크립트를 통해 노출되는 API의 타입입니다.
 */
export interface IElectronAPI {
  setOpacity: (opacity: number) => void;
}

// window 객체에 electronAPI를 추가하기 위한 글로벌 타입 확장
declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
