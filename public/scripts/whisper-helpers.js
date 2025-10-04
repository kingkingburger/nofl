/**
 * =================================================================
 * Whisper Helpers
 * =================================================================
 * Whisper 모델 로딩 및 IndexedDB 캐싱 유틸리티
 */

/**
 * 디버그 출력 텍스트를 textarea와 콘솔에 표시
 * @param {string} text - 출력할 텍스트
 */
export function printTextarea(text) {
  const output = document.getElementById('output');
  if (output) {
    output.value += text + '\n';
    output.scrollTop = output.scrollHeight;
  }
  console.log(text);
}

/**
 * IndexedDB 연결 헬퍼
 * @param {string} dbName - 데이터베이스 이름
 * @param {number} dbVersion - 데이터베이스 버전
 * @returns {Promise<IDBDatabase>}
 */
function openDB(dbName, dbVersion) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files');
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * IndexedDB에서 파일 가져오기
 * @param {IDBDatabase} db - 데이터베이스 인스턴스
 * @param {string} key - 파일 키
 * @returns {Promise<ArrayBuffer|undefined>}
 */
async function getFileFromDB(db, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['files'], 'readonly');
    const store = transaction.objectStore('files');
    const request = store.get(key);

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * IndexedDB에 파일 저장
 * @param {IDBDatabase} db - 데이터베이스 인스턴스
 * @param {string} key - 파일 키
 * @param {ArrayBuffer} value - 파일 데이터
 * @returns {Promise<any>}
 */
async function saveFileToDB(db, key, value) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['files'], 'readwrite');
    const store = transaction.objectStore('files');
    const request = store.put(value, key);

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * 원격 파일 로드 (다운로드 및 IndexedDB 캐싱)
 * @param {string} url - 파일 URL
 * @param {string} dst - 메모리 FS에 저장될 파일명
 * @param {number} size_mb - 예상 파일 크기 (MB)
 * @param {function(number)} cbProgress - 진행률 콜백 (0.0 ~ 1.0)
 * @param {function(string, Uint8Array)} cbReady - 파일 준비 완료 콜백
 * @param {function()} cbCancel - 취소/실패 콜백
 * @param {function(string)} print - 로그 출력 함수
 */
export async function loadRemote(url, dst, size_mb, cbProgress, cbReady, cbCancel, print) {
  print(`js: 원격 파일 로드 중 '${url}' -> '${dst}' (${size_mb} MB)`);

  const dbName = 'whisper.ggerganov.com';
  const dbVersion = 1;

  // IndexedDB 캐시 확인
  try {
    const db = await openDB(dbName, dbVersion);
    const cachedData = await getFileFromDB(db, url);

    if (cachedData) {
      print('js: IndexedDB에서 모델 찾음, 로딩 중...');
      cbReady(dst, new Uint8Array(cachedData));
      return;
    }

    print('js: IndexedDB에 모델 없음, 다운로드 시작...');
  } catch (err) {
    print(`js: IndexedDB 오류: ${err}. 다운로드를 계속합니다.`);
  }

  // 파일 다운로드
  try {
    const response = await fetch(url, { mode: 'cors' });

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('응답 본문이 null입니다');
    }

    const reader = response.body.getReader();
    const contentLength = +response.headers.get('Content-Length');
    let receivedLength = 0;
    const chunks = [];

    // 청크 단위로 다운로드
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      receivedLength += value.length;

      if (contentLength) {
        cbProgress(receivedLength / contentLength);
      }
    }

    // 청크 병합
    const chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }

    cbReady(dst, chunksAll);

    // IndexedDB에 저장
    try {
      const db = await openDB(dbName, dbVersion);
      await saveFileToDB(db, url, chunksAll.buffer);
      print('js: 모델을 IndexedDB에 저장했습니다.');
    } catch (err) {
      print(`js: IndexedDB 저장 실패: ${err}`);
    }

  } catch (err) {
    print(`js: 파일 로드 오류 '${url}': ${err}`);
    if (cbCancel) {
      cbCancel();
    }
  }
}
