
import { contextBridge, ipcRenderer } from 'electron';

// 'electronAPI'라는 이름으로 window 객체에 안전하게 API를 노출합니다.
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * 메인 프로세스에 투명도 변경을 요청합니다.
   * @param opacity - 설정할 투명도 값 (0.0 ~ 1.0)
   */
  setOpacity: (opacity: number) => ipcRenderer.send('set-opacity', opacity),
});
