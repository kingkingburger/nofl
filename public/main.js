// =================================================================
// I. Configuration & Global State
// =================================================================

// Web-audio context
let context = null;

// Audio data buffers
let audio = null;
let audio0 = null; // for continuous recording

// The Whisper C++ instance
let instance = null;

// The name of the Whisper model
let model_whisper = null;

// MediaRecorder instance
let mediaRecorder = null;
let doRecording = false;

// Transcription update interval
let intervalUpdate = null;
let transcribedAll = '';
let nLines = 0;

// IndexedDB configuration
const dbVersion = 1;
const dbName = 'whisper.ggerganov.com';

// =================================================================
// II. Emscripten Module Setup
// =================================================================

// This global `Module` object is required by the Emscripten-generated `stream.js`.
// We configure it before `stream.js` is loaded.
var Module = {
  locateFile: function(path, scriptDirectory) {
    // libstream.wasm should be loaded from the scripts directory
    // Use relative path or let Vite handle the base path
    if (path === 'libstream.wasm') {
      // scriptDirectory already includes the base path from Vite
      return scriptDirectory + 'libstream.wasm';
    }
    return scriptDirectory + path;
  }
};

// =================================================================
// III. DOM Ready - Main Execution
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Element References ---
  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');
  const clearButton = document.getElementById('clear');
  const languageSelect = document.getElementById('language');
  const modelStatus = document.getElementById('model-whisper-status');
  const modelProgress = document.getElementById('fetch-whisper-progress');
  const statusElement = document.getElementById('state-status');
  const transcribedElement = document.getElementById('state-transcribed');

  // Error Modal Elements
  const errorModal = document.getElementById('errorModal');
  const errorTitle = document.getElementById('errorTitle');
  const errorMessage = document.getElementById('errorMessage');
  const errorSolutions = document.getElementById('errorSolutions');
  const errorModalBtn = document.getElementById('errorModalBtn');
  const modalClose = document.querySelector('.modal-close');

  const modelButtons = {
    'base': document.getElementById('fetch-whisper-base'),
  };

  // --- Modal Functions ---
  function showErrorModal(title, message, solutions) {
    errorTitle.textContent = title;
    errorMessage.textContent = message;

    if (solutions && solutions.length > 0) {
      errorSolutions.style.display = 'block';
      const ul = errorSolutions.querySelector('ul');
      ul.innerHTML = solutions.map(sol => `<li>${sol}</li>`).join('');
    } else {
      errorSolutions.style.display = 'none';
    }

    errorModal.classList.add('show');
  }

  function closeErrorModal() {
    errorModal.classList.remove('show');
  }

  errorModalBtn.addEventListener('click', closeErrorModal);
  modalClose.addEventListener('click', closeErrorModal);
  errorModal.addEventListener('click', (e) => {
    if (e.target === errorModal) {
      closeErrorModal();
    }
  });

  // --- Model Management ---

  function storeFS(fname, buf) {
    try {
      Module.FS_unlink(fname);
    } catch (e) {
      // Ignore if file doesn't exist
    }
    Module.FS_createDataFile("/", fname, buf, true, true);
    printTextarea(`storeFS: stored model '${fname}' size: ${buf.length}`);
    modelStatus.innerHTML = `loaded "${model_whisper}"!`;
    if (model_whisper != null) {
      startButton.disabled = false;
      stopButton.disabled = true;
    }
  }

  function loadWhisper(model) {
    const urls = {
      'tiny.en': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin',
      'base.en': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin',
      'base': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
      'tiny-en-q5_1': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en-q5_1.bin',
      'base-en-q5_1': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en-q5_1.bin',
    };
    const sizes = {
      'tiny.en': 75, 'base.en': 142, 'base': 142, 'tiny-en-q5_1': 31, 'base-en-q5_1': 57
    };

    model_whisper = model;
    Object.values(modelButtons).forEach(btn => {
      if (btn) btn.style.display = 'none';
    });
    modelStatus.innerHTML = `loading "${model}" ... `;
    modelProgress.innerHTML = '';

    const cbProgress = (p) => {
      modelProgress.innerHTML = Math.round(100 * p) + '%';
    };
    const cbCancel = () => {
      Object.values(modelButtons).forEach(btn => {
        if (btn) btn.style.display = 'inline-block';
      });
      modelStatus.innerHTML = '';
      modelProgress.innerHTML = '';
    };

    loadRemote(urls[model], 'whisper.bin', sizes[model], cbProgress, storeFS, cbCancel, printTextarea);
  }

  // --- Audio Recording & Processing ---

  const kSampleRate = 16000;
  const kRestartRecording_s = 120;
  const kIntervalAudio_ms = 5000;

  function stopRecording() {
    if (Module && Module.set_status) {
      Module.set_status("paused");
    }
    doRecording = false;

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  }

  function startRecording() {
    if (!context) {
      context = new AudioContext({
        sampleRate: kSampleRate,
        channelCount: 1,
        echoCancellation: false,
        autoGainControl: true,
        noiseSuppression: true,
      });
    }

    Module.set_status("");
    startButton.disabled = true;
    stopButton.disabled = false;
    doRecording = true;

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = event => {
        chunks.push(event.data);
        const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
        const reader = new FileReader();

        reader.onload = () => {
          const buf = new Uint8Array(reader.result);
          if (!context) return;

          context.decodeAudioData(buf.buffer, audioBuffer => {
            const offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(offlineContext.destination);
            source.start(0);

            offlineContext.startRendering().then(renderedBuffer => {
              audio = renderedBuffer.getChannelData(0);
              const audioAll = new Float32Array(audio0 ? audio0.length + audio.length : audio.length);
              if (audio0) audioAll.set(audio0, 0);
              audioAll.set(audio, audio0 ? audio0.length : 0);
              if (instance) Module.set_audio(instance, audioAll);
            });
          }, e => printTextarea(`Error decoding audio: ${e}`));
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

      mediaRecorder.start(kIntervalAudio_ms);

      const checkAndRestartRecording = () => {
        if (!doRecording) {
          return;
        }
        if (audio && audio.length > kSampleRate * kRestartRecording_s) {
          printTextarea('js: restarting recording due to length');
          audio0 = audio;
          audio = null;
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop(); // This will trigger onstop and restart
          }
        } else {
          setTimeout(checkAndRestartRecording, 1000);
        }
      };
      checkAndRestartRecording();
    })
    .catch(err => {
      printTextarea(`js: ❌ 마이크 접근 실패: ${err.name}`);

      let title = '마이크 접근 실패';
      let message = '';
      let solutions = [];

      if (err.name === 'NotFoundError') {
        message = '마이크를 찾을 수 없습니다.';
        solutions = [
          '마이크가 연결되어 있는지 확인하세요',
          '다른 앱에서 마이크를 사용 중인지 확인하세요',
          'Windows 설정 > 개인정보 > 마이크에서 앱 권한을 확인하세요',
          '브라우저를 재시작해보세요'
        ];
      } else if (err.name === 'NotAllowedError') {
        message = '마이크 권한이 거부되었습니다.';
        solutions = [
          '브라우저 주소창의 자물쇠/정보 아이콘을 클릭하세요',
          '마이크 권한을 "허용"으로 변경하세요',
          '페이지를 새로고침한 후 다시 시도하세요'
        ];
      } else if (err.name === 'NotReadableError') {
        message = '마이크에 접근할 수 없습니다.';
        solutions = [
          '다른 앱에서 마이크를 사용하고 있는지 확인하세요',
          '마이크가 다른 프로그램에 의해 점유되어 있을 수 있습니다',
          '컴퓨터를 재시작해보세요'
        ];
      } else {
        message = `오류가 발생했습니다: ${err.message}`;
        solutions = [
          '페이지를 새로고침한 후 다시 시도하세요',
          '마이크 연결 상태를 확인하세요',
          '브라우저를 재시작해보세요'
        ];
      }

      showErrorModal(title, message, solutions);

      startButton.disabled = false;
      stopButton.disabled = true;
      doRecording = false;
    });
  }


  // --- Main Application Logic & UI Handlers ---

  function onStart() {
    if (!instance) {
      instance = Module.init('whisper.bin', languageSelect.value);
      if (instance) {
        printTextarea("js: whisper initialized, instance: " + instance);
      }
    }

    if (!instance) {
      printTextarea("js: failed to initialize whisper");
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

  function onStop() {
    stopRecording();
    if (intervalUpdate) {
      clearInterval(intervalUpdate);
      intervalUpdate = null;
    }
  }

  function clearCache() {
    if (!window.indexedDB) {
      printTextarea("Your browser doesn't support IndexedDB. Cache cannot be cleared.");
      return;
    }
    const req = indexedDB.deleteDatabase(dbName);
    req.onsuccess = () => printTextarea(`Database '${dbName}' deleted successfully`);
    req.onerror = (event) => printTextarea(`Error deleting database: ${event.target.errorCode}`);
    req.onblocked = () => printTextarea("Database deletion blocked. Please close other tabs with this page open.");
  }


  // --- Event Listener Bindings ---
  startButton.addEventListener('click', onStart);
  stopButton.addEventListener('click', onStop);
  clearButton.addEventListener('click', clearCache);
  Object.keys(modelButtons).forEach(modelName => {
    const button = modelButtons[modelName];
    if (button) {
      button.addEventListener('click', () => loadWhisper(modelName));
    }
  });
});
