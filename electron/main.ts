import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import * as vosk from "vosk"
import wav from 'node-wav';

const VOSK_MODEL_PATH = path.resolve(app.getAppPath(), 'public', 'vosk-model-ko-0.22-small');
vosk.setLogLevel(0);
const model = new vosk.Model(VOSK_MODEL_PATH);


let mainWindow: BrowserWindow | null = null;
const currentMode = 'mini'; // 'mini' 또는 'normal'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const isMini = currentMode === 'mini';

  const options: Electron.BrowserWindowConstructorOptions = {
    webPreferences: {
      preload: path.join(app.getAppPath(), 'dist-electron', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    movable: true,
  };

  if (isMini) {
    Object.assign(options, {
      width: 200,
      height: 400,
      alwaysOnTop: true,
      transparent: true,
      frame: false,
    });
  } else {
    Object.assign(options, {
      width: 800,
      height: 600,
      alwaysOnTop: false,
      transparent: false,
      frame: true,
    });
  }

  // 창을 새로 만들 때 이전 위치를 유지합니다.
  if (mainWindow) {
    const [x, y] = mainWindow.getPosition();
    options.x = x;
    options.y = y;
  }

  // 이전 창이 있다면 닫습니다.
  mainWindow?.close();

  mainWindow = new BrowserWindow(options);
  
  // 개발 서버 URL 또는 빌드된 파일 경로를 로드합니다.
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // 개발자 도구를 열고 싶다면 주석을 해제하세요.
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 핸들러
ipcMain.on('set-opacity', (event, opacity) => {
  if (mainWindow) {
    mainWindow.setOpacity(opacity);
  }
});

ipcMain.on('enter-normal-mode', () => {
  if (mainWindow) {
    mainWindow.setSize(800, 600);
    mainWindow.setAlwaysOnTop(false);
  }
});

ipcMain.on('enter-mini-mode', () => {
  if (mainWindow) {
    mainWindow.setSize(200, 400);
    mainWindow.setAlwaysOnTop(true);
  }
});

ipcMain.on('audio-data', (event, data) => {
  const buffer = Buffer.from(data);
  const result = wav.decode(buffer);

  if (result.channelData[0]) {
    const rec = new vosk.Recognizer({ model: model, sampleRate: result.sampleRate });

    // Convert Float32Array to 16-bit PCM Buffer
    const pcmData = new Int16Array(result.channelData[0].length);
    for (let i = 0; i < result.channelData[0].length; i++) {
      pcmData[i] = Math.max(-1, Math.min(1, result.channelData[0][i])) * 32767;
    }
    const audioBuffer = Buffer.from(pcmData.buffer);

    rec.acceptWaveform(audioBuffer);
    const finalResult = rec.finalResult();
    rec.free();

    if (mainWindow && finalResult.text) {
      mainWindow.webContents.send('transcript', finalResult.text);
    }
  }
});