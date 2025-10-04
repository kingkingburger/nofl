/**
 * =================================================================
 * Whisper Engine
 * =================================================================
 * Whisper 음성 인식 엔진 및 오디오 녹음 관리
 */

import { printTextarea, loadRemote } from './whisper-helpers.js';

// =================================================================
// Constants
// =================================================================
const SAMPLE_RATE = 16000;
const RESTART_RECORDING_SECONDS = 120;
const AUDIO_INTERVAL_MS = 5000;
const DB_NAME = 'whisper.ggerganov.com';
const DB_VERSION = 1;

// Whisper 모델 URL 및 크기
const WHISPER_MODELS = {
  'tiny.en': {
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin',
    size: 75
  },
  'base.en': {
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin',
    size: 142
  },
  'base': {
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
    size: 142
  },
  'tiny-en-q5_1': {
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en-q5_1.bin',
    size: 31
  },
  'base-en-q5_1': {
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en-q5_1.bin',
    size: 57
  }
};

// =================================================================
// Global State
// =================================================================
let context = null;
let audio = null;
let audio0 = null;
let instance = null;
let modelWhisper = null;
let mediaRecorder = null;
let doRecording = false;
let intervalUpdate = null;
let transcribedAll = '';
let nLines = 0;

// =================================================================
// Emscripten Module Configuration
// =================================================================
window.Module = {
  print: printTextarea,
  printErr: printTextarea,
  setStatus: function(text) {
    printTextarea('js: ' + text);
  },
  monitorRunDependencies: function(left) {},
  preRun: function() {
    printTextarea('js: Whisper 준비 중...');
  },
  postRun: function() {
    printTextarea('js: Whisper 초기화 완료!');
  }
};

// =================================================================
// Model Management
// =================================================================

/**
 * Whisper 모델 파일을 파일 시스템에 저장
 * @param {string} fname - 파일명
 * @param {Uint8Array} buf - 파일 데이터
 */
function storeFS(fname, buf) {
  const modelStatus = document.getElementById('model-whisper-status');
  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');

  try {
    Module.FS_unlink(fname);
  } catch (e) {
    // 파일이 없으면 무시
  }

  Module.FS_createDataFile('/', fname, buf, true, true);
  printTextarea(`파일 시스템 저장: '${fname}' (크기: ${buf.length})`);

  modelStatus.innerHTML = `"${modelWhisper}" 로드 완료!`;

  if (modelWhisper != null) {
    startButton.disabled = false;
    stopButton.disabled = true;
  }
}

/**
 * Whisper 모델 로드
 * @param {string} model - 모델 이름
 */
export function loadWhisper(model) {
  const modelButtons = document.getElementById('model-whisper').querySelectorAll('.model-buttons button');
  const modelStatus = document.getElementById('model-whisper-status');
  const modelProgress = document.getElementById('fetch-whisper-progress');

  const modelConfig = WHISPER_MODELS[model];
  if (!modelConfig) {
    printTextarea(`알 수 없는 모델: ${model}`);
    return;
  }

  modelWhisper = model;

  // 모델 버튼 숨기기
  modelButtons.forEach(btn => btn.style.display = 'none');

  modelStatus.innerHTML = `"${model}" 로딩 중...`;
  modelProgress.innerHTML = '';

  const cbProgress = (p) => {
    modelProgress.innerHTML = Math.round(100 * p) + '%';
  };

  const cbCancel = () => {
    modelButtons.forEach(btn => btn.style.display = 'inline-block');
    modelStatus.innerHTML = '';
    modelProgress.innerHTML = '';
  };

  loadRemote(
    modelConfig.url,
    'whisper.bin',
    modelConfig.size,
    cbProgress,
    storeFS,
    cbCancel,
    printTextarea
  );
}

// =================================================================
// Audio Recording
// =================================================================

/**
 * 녹음 중지
 */
function stopRecording() {
  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');

  if (Module && Module.set_status) {
    Module.set_status('일시정지됨');
  }

  doRecording = false;

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
}

/**
 * 녹음 시작
 */
function startRecording() {
  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');

  if (!context) {
    context = new AudioContext({
      sampleRate: SAMPLE_RATE,
      channelCount: 1,
      echoCancellation: false,
      autoGainControl: true,
      noiseSuppression: true,
    });
  }

  Module.set_status('');
  startButton.disabled = true;
  stopButton.disabled = false;
  doRecording = true;

  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        const reader = new FileReader();

        reader.onload = () => {
          const buf = new Uint8Array(reader.result);
          if (!context) return;

          context.decodeAudioData(buf.buffer, audioBuffer => {
            const offlineContext = new OfflineAudioContext(
              audioBuffer.numberOfChannels,
              audioBuffer.length,
              audioBuffer.sampleRate
            );

            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(offlineContext.destination);
            source.start(0);

            offlineContext.startRendering().then(renderedBuffer => {
              audio = renderedBuffer.getChannelData(0);

              const audioAll = new Float32Array(
                audio0 ? audio0.length + audio.length : audio.length
              );

              if (audio0) audioAll.set(audio0, 0);
              audioAll.set(audio, audio0 ? audio0.length : 0);

              if (instance) Module.set_audio(instance, audioAll);
            });
          }, (e) => printTextarea(`오디오 디코딩 오류: ${e}`));
        };

        reader.readAsArrayBuffer(blob);
      };

      mediaRecorder.onstop = () => {
        if (doRecording) {
          setTimeout(startRecording, 100);
        } else {
          stream.getTracks().forEach(track => track.stop());
          audio0 = null;
          audio = null;
          context = null;
          startButton.disabled = false;
          stopButton.disabled = true;
        }
      };

      mediaRecorder.start(AUDIO_INTERVAL_MS);

      // 녹음 길이 체크 및 재시작
      const checkAndRestartRecording = () => {
        if (!doRecording) return;

        if (audio && audio.length > SAMPLE_RATE * RESTART_RECORDING_SECONDS) {
          printTextarea('js: 녹음 길이 제한으로 재시작');
          audio0 = audio;
          audio = null;

          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        } else {
          setTimeout(checkAndRestartRecording, 1000);
        }
      };

      checkAndRestartRecording();
    })
    .catch(err => printTextarea(`js: 오디오 스트림 오류: ${err}`));
}

// =================================================================
// Transcription & UI
// =================================================================

/**
 * 녹음 및 전사 시작
 */
function onStart() {
  const languageSelect = document.getElementById('language');
  const statusElement = document.getElementById('state-status');
  const transcribedElement = document.getElementById('state-transcribed');

  if (!instance) {
    instance = Module.init('whisper.bin', languageSelect.value);
    if (instance) {
      printTextarea('js: Whisper 초기화됨, 인스턴스: ' + instance);
    }
  }

  if (!instance) {
    printTextarea('js: Whisper 초기화 실패');
    return;
  }

  startRecording();

  if (intervalUpdate) {
    clearInterval(intervalUpdate);
  }

  intervalUpdate = setInterval(() => {
    const transcribed = Module.get_transcribed();
    if (transcribed && transcribed.length > 1) {
      transcribedAll += transcribed + '<br>';
      nLines++;

      if (nLines > 10) {
        const i = transcribedAll.indexOf('<br>');
        if (i > 0) {
          transcribedAll = transcribedAll.substring(i + 4);
          nLines--;
        }
      }
    }

    statusElement.innerHTML = Module.get_status();
    transcribedElement.innerHTML = transcribedAll;
  }, 100);
}

/**
 * 녹음 중지
 */
function onStop() {
  stopRecording();

  if (intervalUpdate) {
    clearInterval(intervalUpdate);
    intervalUpdate = null;
  }
}

/**
 * IndexedDB 캐시 지우기
 */
function clearCache() {
  if (!window.indexedDB) {
    printTextarea('브라우저가 IndexedDB를 지원하지 않습니다. 캐시를 지울 수 없습니다.');
    return;
  }

  const req = indexedDB.deleteDatabase(DB_NAME);

  req.onsuccess = () => printTextarea(`데이터베이스 '${DB_NAME}' 삭제 성공`);
  req.onerror = (event) => printTextarea(`데이터베이스 삭제 오류: ${event.target.errorCode}`);
  req.onblocked = () => printTextarea('데이터베이스 삭제가 차단되었습니다. 이 페이지가 열린 다른 탭을 닫아주세요.');
}

// =================================================================
// Initialization
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');
  const clearButton = document.getElementById('clear');

  // 이벤트 리스너 등록
  startButton.addEventListener('click', onStart);
  stopButton.addEventListener('click', onStop);
  clearButton.addEventListener('click', clearCache);

  // 모델 버튼 등록
  Object.keys(WHISPER_MODELS).forEach(modelName => {
    const btn = document.getElementById(`fetch-whisper-${modelName.replace(/\./g, '-')}`);
    if (btn) {
      btn.addEventListener('click', () => loadWhisper(modelName));
    }
  });

  printTextarea('Whisper 엔진 준비 완료');
});
