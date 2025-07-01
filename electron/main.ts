
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

// 애플리케이션 창을 생성하는 함수
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 200,
    height: 400,
    webPreferences: {
      // __dirname 대신 app.getAppPath()를 사용하여 빌드된 앱에서도 올바른 경로를 찾도록 합니다.
      preload: path.join(app.getAppPath(), 'dist-electron', 'preload.js'),
      contextIsolation: true, // 보안을 위해 컨텍스트 격리 활성화
      nodeIntegration: false, // Node.js 통합 비활성화
    },
    // alwaysOnTop: true, // 항상 위에 표시
    transparent: true, // 창 배경 투명화
    movable: true,             // (기본값) 윈도우를 움직일 수 있게 해줘요
    frame: false, // 창 프레임 제거 (타이틀바 등)
  });

  
  mainWindow.loadURL('http://localhost:5173');
  // mainWindow.webContents.openDevTools(); // 개발자 도구 열기
  
  // 렌더러 프로세스로부터 투명도 값을 받기 위한 IPC 핸들러
  ipcMain.on('set-opacity', (event, opacity) => {
    mainWindow.setOpacity(opacity);
  });
}

// Electron 앱이 준비되면 창을 생성합니다.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // macOS에서 독 아이콘을 클릭했을 때 창이 없으면 새로 생성합니다.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 모든 창이 닫히면 앱을 종료합니다. (Windows & Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
