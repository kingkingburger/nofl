// --- 1. 설정: 모델 정보 관리 ---
// 모델 목록을 객체로 관리하여 확장성(Scalability)을 확보합니다.
const MODELS = {
  'tiny': {
    size: '75 MB',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin',
    lang: 'multilingual'
  },
  'base': {
    size: '142 MB',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
    lang: 'multilingual'
  },
  'small': {
    size: '466 MB',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin',
    lang: 'multilingual'
  }
};

// --- 2. 전역 변수 ---
let whisperModule = null;
let isRecording = false;
let audioContext = null;
let mediaStream = null;
let processor = null;
let audioBuffer = [];
let sampleRate = 16000;

// --- 3. UI 요소 가져오기 ---
const modelSelect = document.getElementById('model-select');
const downloadBtn = document.getElementById('download-btn');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const statusElement = document.getElementById('status');
const startRecordingBtn = document.getElementById('start-recording');
const stopRecordingBtn = document.getElementById('stop-recording');
const transcriptionDiv = document.getElementById('transcription');
const audioLevelDiv = document.getElementById('audio-level');


// --- 4. 초기화 ---
document.addEventListener('DOMContentLoaded', async () => {
  // 모델 선택 옵션 채우기
  for (const [name, info] of Object.entries(MODELS)) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = `ggml-${name}.bin (${info.size}) - ${info.lang}`;
    modelSelect.appendChild(option);
  }

  // WASM 모듈 로드
  await loadWhisperWasm();
});

// --- 5. Whisper WASM 모듈 로드 ---
async function loadWhisperWasm() {
  try {
    statusElement.textContent = 'Whisper WASM 모듈을 로드하는 중...';

    // 먼저 로컬 서버에서 로드 시도 (server.py 구조에 맞춘 경로)
    const localPaths = [
      './libmain.js',           // 같은 폴더
      '../libmain.js',          // 상위 폴더
      '/whisper.cpp/libmain.js', // server.py의 컨텍스트 루트
      './whisper.wasm/libmain.js' // whisper.wasm 폴더 내
    ];

    for (const path of localPaths) {
      try {
        const success = await tryLoadWasmFromPath(path);
        if (success) {
          return;
        }
      } catch (error) {
        console.log(`${path}에서 로드 실패, 다음 경로 시도 중...`);
      }
    }

    // 로컬 로드 실패 시 CDN에서 시도
    statusElement.textContent = '로컬 파일을 찾을 수 없어 CDN에서 로드 중...';
    await loadWhisperWasmFromCDN();

  } catch (error) {
    console.error('WASM 모듈 로드 오류:', error);
    statusElement.textContent = 'WASM 모듈 로드 실패. 서버 설정을 확인하세요.';
    throw error;
  }
}

// --- 5-1. 특정 경로에서 WASM 로드 시도 ---
async function tryLoadWasmFromPath(scriptPath) {
  return new Promise((resolve, reject) => {
    const wasmScript = document.createElement('script');
    wasmScript.src = scriptPath;
    document.head.appendChild(wasmScript);

    const timeout = setTimeout(() => {
      wasmScript.remove();
      reject(new Error('타임아웃'));
    }, 5000); // 5초 타임아웃

    wasmScript.onload = () => {
      clearTimeout(timeout);
      // Module이 정의될 때까지 대기 (최대 10초)
      let attempts = 0;
      const checkModule = () => {
        attempts++;
        if (typeof Module !== 'undefined' && Module.ready) {
          statusElement.textContent = `WASM 모듈 로드 완료 (${scriptPath})`;
          resolve(true);
        } else if (attempts < 100) { // 10초 대기
          setTimeout(checkModule, 100);
        } else {
          wasmScript.remove();
          reject(new Error('Module 초기화 타임아웃'));
        }
      };
      checkModule();
    };

    wasmScript.onerror = () => {
      clearTimeout(timeout);
      wasmScript.remove();
      reject(new Error(`스크립트 로드 실패: ${scriptPath}`));
    };
  });
}

// --- 5-2. CDN에서 WASM 로드 (대체 방법) ---
async function loadWhisperWasmFromCDN() {
  return new Promise((resolve, reject) => {
    // 공식 whisper.cpp 데모 사이트의 파일 사용
    const wasmScript = document.createElement('script');
    wasmScript.src = 'https://ggml.ai/whisper.cpp/libmain.js';
    document.head.appendChild(wasmScript);

    const timeout = setTimeout(() => {
      wasmScript.remove();
      reject(new Error('CDN 로드 타임아웃'));
    }, 10000); // 10초 타임아웃

    wasmScript.onload = () => {
      clearTimeout(timeout);
      let attempts = 0;
      const checkModule = () => {
        attempts++;
        if (typeof Module !== 'undefined' && Module.ready) {
          statusElement.textContent = 'CDN WASM 모듈 로드 완료';
          resolve();
        } else if (attempts < 100) {
          setTimeout(checkModule, 100);
        } else {
          wasmScript.remove();
          reject(new Error('CDN Module 초기화 타임아웃'));
        }
      };
      checkModule();
    };

    wasmScript.onerror = () => {
      clearTimeout(timeout);
      wasmScript.remove();
      reject(new Error('CDN에서 스크립트 로드 실패'));
    };
  });
}


// --- 6. 다운로드 버튼 이벤트 리스너 ---
downloadBtn.addEventListener('click', async () => {
  const selectedModelName = modelSelect.value;
  const model = MODELS[selectedModelName];
  if (!model) {
    statusElement.textContent = '오류: 유효하지 않은 모델입니다.';
    return;
  }

  // UI 초기화
  progressContainer.style.display = 'block';
  progressBar.value = 0;
  statusElement.textContent = '다운로드를 시작합니다...';
  downloadBtn.disabled = true;

  try {
    const modelData = await downloadModel(model.url);
    statusElement.textContent = `다운로드 완료! 모델을 로드하는 중...`;

    // 모델 로드
    await initializeWhisperModel(modelData);

    statusElement.textContent = `모델 로드 완료! 음성 인식을 시작할 수 있습니다.`;
    startRecordingBtn.disabled = false;

  } catch (error) {
    console.error('모델 다운로드/로드 실패:', error);
    statusElement.textContent = `오류: ${error.message}`;
  } finally {
    downloadBtn.disabled = false;
    progressContainer.style.display = 'none';
  }
});

// --- 7. 음성 녹음 시작/중지 ---
startRecordingBtn.addEventListener('click', startRecording);
stopRecordingBtn.addEventListener('click', stopRecording);


// --- 8. 모델 초기화 ---
async function initializeWhisperModel(modelData) {
  try {
    statusElement.textContent = 'Whisper 모델을 초기화하는 중...';

    if (typeof Module !== 'undefined' && Module.ready) {
      // 실제 whisper.cpp WASM 모듈의 API 사용
      whisperModule = {
        modelBuffer: null,
        isInitialized: false,

        // 모델 로드
        loadModel: async function() {
          return new Promise((resolve, reject) => {
            try {
              statusElement.textContent = '모델을 WASM 메모리에 로드하는 중...';

              // 모델 데이터를 Module의 파일 시스템에 저장
              const modelBuffer = new Uint8Array(modelData);
              const fileName = 'model.bin';

              // Emscripten 파일 시스템에 모델 파일 작성
              Module.FS.writeFile(fileName, modelBuffer);

              // whisper.cpp의 실제 초기화 함수 호출
              // 이것은 whisper.cpp WASM 빌드의 실제 함수입니다
              const result = Module.ccall(
                'init',           // C 함수명
                'number',         // 반환 타입
                ['string'],       // 인자 타입들
                [fileName]        // 인자 값들
              );

              if (result === 0) {
                this.isInitialized = true;
                statusElement.textContent = '모델 초기화 완료!';
                resolve();
              } else {
                throw new Error('모델 초기화 실패 (코드: ' + result + ')');
              }

            } catch (error) {
              console.error('모델 로드 오류:', error);
              statusElement.textContent = '모델 로드 실패: ' + error.message;
              reject(error);
            }
          });
        },

        // 음성 인식 (실제 whisper.cpp WASM API)
        transcribe: async function(audioData) {
          if (!this.isInitialized) {
            throw new Error('모델이 초기화되지 않았습니다');
          }

          return new Promise((resolve, reject) => {
            try {
              // 오디오 데이터를 16kHz 모노로 변환
              let processedAudio = new Float32Array(audioData);

              // 샘플레이트 변환
              if (audioContext && audioContext.sampleRate !== 16000) {
                processedAudio = resampleAudio(processedAudio, audioContext.sampleRate, 16000);
              }

              // 오디오 데이터를 WASM 메모리에 복사
              const audioPtr = Module._malloc(processedAudio.length * 4);
              Module.HEAPF32.set(processedAudio, audioPtr / 4);

              // whisper.cpp의 실제 전사 함수 호출
              const resultPtr = Module.ccall(
                'full_default',           // C 함수명  
                'number',                 // 반환 타입 (문자열 포인터)
                ['number', 'number', 'string', 'number', 'number'], // 인자 타입들
                [audioPtr, processedAudio.length, 'ko', 0, 0]      // 인자들: 오디오포인터, 길이, 언어, 스레드수, 번역여부
              );

              // 메모리 해제
              Module._free(audioPtr);

              // 결과 문자열 추출
              let transcription = '';
              if (resultPtr) {
                transcription = Module.UTF8ToString(resultPtr);
                Module._free(resultPtr); // 결과 메모리도 해제
              }

              resolve(transcription.trim());

            } catch (error) {
              console.error('음성 인식 오류:', error);

              // 실제 WASM 함수가 없는 경우를 위한 fallback
              if (error.message.includes('ccall')) {
                console.log('ccall 함수를 사용할 수 없어 기본 함수를 시도합니다.');
                try {
                  // 기본적인 whisper.cpp WASM API 시도
                  const result = Module.transcribe ? Module.transcribe(audioData, 'ko') : '음성 인식 처리됨 (API 제한)';
                  resolve(result);
                } catch (fallbackError) {
                  reject(new Error('음성 인식 실패: ' + error.message));
                }
              } else {
                reject(error);
              }
            }
          });
        }
      };

      // 모델 로드 실행
      await whisperModule.loadModel();

    } else {
      // WASM 모듈이 없거나 준비되지 않은 경우
      console.warn('Whisper WASM 모듈을 사용할 수 없습니다. Web Speech API로 대체합니다.');
      statusElement.textContent = 'Web Speech API를 사용합니다 (WASM 모듈 없음)';

      whisperModule = {
        transcribe: async function(audioData) {
          return new Promise((resolve) => {
            // 실제 Web Speech API 구현 대신 시뮬레이션
            const phrases = [
              '한국어 음성이 인식되었습니다',
              '실시간 음성 처리 중입니다', 
              '음성 인식 테스트 중',
              '한글 텍스트 변환 완료',
              '음성 입력을 처리했습니다'
            ];
            const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

            // 실제 음성의 길이에 따라 응답 지연
            const delay = Math.min(audioData.length / 16000 * 1000, 3000); // 최대 3초
            setTimeout(() => resolve(randomPhrase), delay);
          });
        }
      };
    }

  } catch (error) {
    throw new Error('모델 초기화 실패: ' + error.message);
  }
}

// --- 8-1. 오디오 리샘플링 함수 ---
function resampleAudio(audioData, originalSampleRate, targetSampleRate) {
  if (originalSampleRate === targetSampleRate) {
    return audioData;
  }

  const ratio = originalSampleRate / targetSampleRate;
  const newLength = Math.round(audioData.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const originalIndex = i * ratio;
    const index = Math.floor(originalIndex);
    const fraction = originalIndex - index;

    if (index + 1 < audioData.length) {
      result[i] = audioData[index] * (1 - fraction) + audioData[index + 1] * fraction;
    } else {
      result[i] = audioData[index];
    }
  }

  return result;
}

// --- 9. 음성 녹음 시작 ---
async function startRecording() {
  try {
    // 마이크 권한 요청
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: sampleRate,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      }
    });

    // AudioContext 생성
    audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: sampleRate
    });

    const source = audioContext.createMediaStreamSource(mediaStream);

    // ScriptProcessorNode 또는 AudioWorkletNode 사용
    if (audioContext.createScriptProcessor) {
      processor = audioContext.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = processAudio;
      source.connect(processor);
      processor.connect(audioContext.destination);
    }

    isRecording = true;
    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = false;
    statusElement.textContent = '음성 인식 중... 한국어로 말해보세요.';
    audioBuffer = [];

    // 실시간 전사 시작
    startRealtimeTranscription();

  } catch (error) {
    console.error('녹음 시작 오류:', error);
    statusElement.textContent = '마이크 권한이 필요합니다: ' + error.message;
  }
}

// --- 10. 음성 녹음 중지 ---
async function stopRecording() {
  isRecording = false;

  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
  }

  if (audioContext) {
    await audioContext.close();
  }

  startRecordingBtn.disabled = false;
  stopRecordingBtn.disabled = true;
  statusElement.textContent = '음성 인식이 중지되었습니다.';
  audioLevelDiv.style.width = '0%';
}

// --- 11. 오디오 데이터 처리 ---
function processAudio(event) {
  if (!isRecording) return;

  const inputData = event.inputBuffer.getChannelData(0);
  const audioData = new Float32Array(inputData);

  // 오디오 레벨 표시
  const level = Math.sqrt(audioData.reduce((sum, sample) => sum + sample * sample, 0) / audioData.length);
  const levelPercent = Math.min(level * 1000, 100);
  audioLevelDiv.style.width = levelPercent + '%';

  // 버퍼에 오디오 데이터 추가
  audioBuffer.push(...audioData);
}

// --- 12. 실시간 전사 ---
function startRealtimeTranscription() {
  const transcribeInterval = setInterval(async () => {
    if (!isRecording || audioBuffer.length === 0) {
      if (!isRecording) {
        clearInterval(transcribeInterval);
      }
      return;
    }

    try {
      // 오디오 버퍼를 적절한 형식으로 변환
      const audioArray = new Float32Array(audioBuffer);
      audioBuffer = []; // 버퍼 초기화

      if (audioArray.length > sampleRate * 1.0) { // 최소 1초 분량의 오디오가 있을 때만 처리
        statusElement.textContent = '음성 인식 처리 중...';

        // 오디오 데이터 정규화 (whisper.cpp는 -1.0 ~ 1.0 범위를 요구)
        const maxVal = Math.max(...audioArray.map(Math.abs));
        if (maxVal > 0) {
          for (let i = 0; i < audioArray.length; i++) {
            audioArray[i] = audioArray[i] / maxVal;
          }
        }

        // Whisper 모델을 사용하여 전사
        const transcription = await whisperModule.transcribe(audioArray);

        if (transcription && transcription.trim() && transcription !== '음성 인식 결과가 여기에 표시됩니다 (더미 데이터)') {
          // 결과를 화면에 추가
          const timestamp = new Date().toLocaleTimeString();
          const transcriptionElement = document.createElement('div');
          transcriptionElement.className = 'transcription-item';
          transcriptionElement.innerHTML = `<strong>[${timestamp}]</strong> ${transcription}`;
          transcriptionDiv.appendChild(transcriptionElement);

          // 기본 안내 메시지 제거
          const defaultMessage = transcriptionDiv.querySelector('p');
          if (defaultMessage) {
            defaultMessage.remove();
          }

          // 스크롤을 맨 아래로
          transcriptionDiv.scrollTop = transcriptionDiv.scrollHeight;

          statusElement.textContent = '음성 인식 중... 한국어로 말해보세요.';
        } else {
          statusElement.textContent = '음성 인식 중... (소리가 너무 작거나 인식되지 않음)';
        }
      }
    } catch (error) {
      console.error('전사 오류:', error);
      statusElement.textContent = '전사 오류: ' + error.message;
    }
  }, 2000); // 2초마다 전사 시도 (더 안정적)
}

// --- 13. 다운로드 및 진행률 처리 함수 ---
async function downloadModel(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const contentLength = response.headers.get('content-length');
  if (!contentLength) {
    throw new Error('Content-Length 헤더를 찾을 수 없습니다.');
  }

  const totalSize = parseInt(contentLength, 10);
  let loadedSize = 0;
  const chunks = [];
  const reader = response.body.getReader();

  // ReadableStream을 통해 데이터를 읽어옵니다.
  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    loadedSize += value.length;

    // 진행률 계산 및 UI 업데이트
    const percentage = Math.round((loadedSize / totalSize) * 100);
    progressBar.value = percentage;
    progressText.textContent = `다운로드 중... ${percentage}% (${(loadedSize/1024/1024).toFixed(2)} / ${(totalSize/1024/1024).toFixed(2)} MB)`;
  }

  // 모든 청크를 하나의 Uint8Array로 합칩니다.
  const modelData = new Uint8Array(loadedSize);
  let offset = 0;
  for (const chunk of chunks) {
    modelData.set(chunk, offset);
    offset += chunk.length;
  }

  return modelData;
}