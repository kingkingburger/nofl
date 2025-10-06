/**
 * Prints text to the debug output textarea.
 * @param {string} text The text to print.
 */
function printTextarea(text) {
  const output = document.getElementById('output');
  if (output) {
    output.value += text + '\n';
    output.scrollTop = output.scrollHeight; // Scroll to bottom
  }
  console.log(text);
}

/**
 * Loads a remote file, reports progress, and caches it in IndexedDB.
 * @param {string} url - The URL of the file to fetch.
 * @param {string} dst - The destination filename for in-memory FS.
 * @param {number} size_mb - The expected size in MB for logging.
 * @param {function(number)} cbProgress - Callback for download progress (0.0 to 1.0).
 * @param {function(string, Uint8Array)} cbReady - Callback when the file is ready.
 * @param {function()} cbCancel - Callback if the download is canceled or fails.
 * @param {function(string)} print - Function to log messages.
 */
async function loadRemote(url, dst, size_mb, cbProgress, cbReady, cbCancel, print) {
  print(`js: loading remote '${url}' to '${dst}' (${size_mb} MB)`);

  const dbName = 'whisper.ggerganov.com';
  const dbVersion = 1;

  // --- IndexedDB Helper ---
  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files');
        }
      };
      request.onsuccess = event => resolve(event.target.result);
      request.onerror = event => reject(event.target.error);
    });
  }

  async function getFileFromDB(db, key) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.get(key);
      request.onsuccess = event => resolve(event.target.result);
      request.onerror = event => reject(event.target.error);
    });
  }

  async function saveFileToDB(db, key, value) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.put(value, key);
      request.onsuccess = event => resolve(event.target.result);
      request.onerror = event => reject(event.target.error);
    });
  }

  // --- Main Logic ---
  try {
    const db = await openDB();
    const cachedData = await getFileFromDB(db, url);
    if (cachedData) {
      print("js: found model in IndexedDB, loading...");
      cbReady(dst, new Uint8Array(cachedData));
      return;
    }
    print("js: model not found in IndexedDB, downloading...");
  } catch (err) {
    print(`js: IndexedDB error: ${err}. Continuing with download.`);
  }

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const contentLength = +response.headers.get('Content-Length');
    let receivedLength = 0;
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;
      if (contentLength) {
        cbProgress(receivedLength / contentLength);
      }
    }

    const chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }

    cbReady(dst, chunksAll);

    try {
      const db = await openDB();
      await saveFileToDB(db, url, chunksAll.buffer);
      print("js: model saved to IndexedDB for future use.");
    } catch (err) {
      print(`js: Failed to save model to IndexedDB: ${err}`);
    }

  } catch (err) {
    print(`js: error loading remote '${url}': ${err}`);
    if (cbCancel) {
      cbCancel();
    }
  }
}
