import { contextBridge, ipcRenderer } from 'electron';
// 'electronAPI'라는 이름으로 window 객체에 안전하게 API를 노출합니다.
contextBridge.exposeInMainWorld('electronAPI', {
    /**
     * 메인 프로세스에 투명도 변경을 요청합니다.
     * @param opacity - 설정할 투명도 값 (0.0 ~ 1.0)
     */
    setOpacity: (opacity) => ipcRenderer.send('set-opacity', opacity),
    /**
     * 메인 프로세스에 일반 모드로 전환하도록 요청합니다.
     */
    enterNormalMode: () => ipcRenderer.send('enter-normal-mode'),
    /**
     * 메인 프로세스에 미니 모드로 전환하도록 요청합니다.
     */
    enterMiniMode: () => ipcRenderer.send('enter-mini-mode'),
    /**
     * 음성 데이터를 메인 프로세스로 전송합니다.
     * @param data - 오디오 데이터 (Blob)
     */
    sendAudioData: (data) => {
        const reader = new FileReader();
        reader.onload = () => {
            const buffer = Buffer.from(reader.result);
            ipcRenderer.send('audio-data', buffer);
        };
        reader.readAsArrayBuffer(data);
    },
    /**
     * 메인 프로세스로부터 음성 인식 결과를 수신하는 리스너를 등록합니다.
     * @param callback - 음성 인식 결과를 처리할 콜백 함수
     */
    onSpeechToTextResult: (callback) => {
        ipcRenderer.on('speech-to-text-result', (event, text) => {
            callback(text);
        });
    },
});
