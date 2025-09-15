// Common Javascript functions used by the examples

function convertTypedArray(src, type) {
    var buffer = new ArrayBuffer(src.byteLength);
    var baseView = new src.constructor(buffer).set(src);
    return new type(buffer);
}

var printTextarea = (function() {
    var element = document.getElementById('output');
    if (element) element.value = ''; // clear browser cache
    return function(text) {
        if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
        console.log(text);
        if (element) {
            element.value += text + "\n";
            element.scrollTop = element.scrollHeight; // focus on bottom
        }
    };
})();

async function clearCache() {
    if (confirm('Are you sure you want to clear the cache?\nAll the models will be downloaded again.')) {
        indexedDB.deleteDatabase(dbName);
        location.reload();
    }
}

// fetch a remote file from remote URL using the Fetch API
async function fetchRemote(url, cbProgress, cbPrint) {
    cbPrint('fetchRemote: downloading with fetch()...');

    const response = await fetch(
        url,
        {
            method: 'GET',
        }
    );

    if (!response.ok) {
        cbPrint('fetchRemote: failed to fetch ' + url);
        return;
    }

    const contentLength = response.headers.get('content-length');
    const total = parseInt(contentLength, 10);
    const reader = response.body.getReader();

    var chunks = [];
    var receivedLength = 0;
    var progressLast = -1;

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        chunks.push(value);
        receivedLength += value.length;

        if (contentLength) {
            cbProgress(receivedLength/total);
// Whisper WebAssembly Worker
let whisperModule = null;
let whisperInstance = null;
let isModelLoaded = false;

// Import helpers from the main thread context
importScripts('../helpers.js');

const dbName = 'whisper.ggerganov.com';
const dbVersion = 1;

// Message handler for the worker
self.onmessage = async function(event) {
    const { id, type, payload } = event.data;

    try {
        switch (type) {
            case 'load':
                await loadWhisperModel(id, payload);
                break;
            case 'transcribe':
                await transcribeAudio(id, payload);
                break;
            default:
                postMessage({
                    id,
                    type: 'error',
                    payload: { error: `Unknown message type: ${type}` }
                });
        }
    } catch (error) {
        postMessage({
            id,
            type: 'error',
            payload: { error: error.message }
        });
    }
};

async function loadWhisperModel(id, payload) {
    const { model, url } = payload;

    try {
        postMessage({
            id,
            type: 'load',
            payload: { status: 'progress', progress: 0, message: 'Loading Whisper WASM module...' }
        });

        // Load the Whisper WASM module
        if (!whisperModule) {
            whisperModule = await import('./stream.js');

            // Initialize the module
            await new Promise((resolve, reject) => {
                whisperModule.default({
                    print: (text) => console.log('WASM:', text),
                    printErr: (text) => console.error('WASM:', text),
                    onRuntimeInitialized: resolve,
                    onAbort: reject
                });
            });
        }

        postMessage({
            id,
            type: 'load',
            payload: { status: 'progress', progress: 50, message: 'Loading model file...' }
        });

        // Load the model file using the helpers
        await new Promise((resolve, reject) => {
            const modelUrls = {
                'ggml-base.bin': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
                'ggml-tiny.en.bin': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin',
                'ggml-base.en.bin': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin'
            };

            const modelSizes = {
                'ggml-base.bin': 142,
                'ggml-tiny.en.bin': 75,
                'ggml-base.en.bin': 142
            };

            const modelUrl = modelUrls[model] || url;
            const modelSize = modelSizes[model] || 142;

            loadRemote(
                modelUrl,
                'whisper.bin',
                modelSize,
                (progress) => {
                    postMessage({
                        id,
                        type: 'load',
                        payload: { 
                            status: 'progress', 
                            progress: 50 + (progress * 50),
                            message: `Loading model: ${Math.round(progress * 100)}%`
                        }
                    });
                },
                (dst, data) => {
                    // Store the model in the WASM filesystem
                    try {
                        whisperModule.FS_unlink(dst);
                    } catch (e) {
                        // File doesn't exist, ignore
                    }

                    whisperModule.FS_createDataFile("/", dst, data, true, true);

                    // Initialize whisper instance
                    whisperInstance = whisperModule.init(dst, 'auto');
                    isModelLoaded = true;

                    postMessage({
                        id,
                        type: 'load',
                        payload: { status: 'complete', message: 'Model loaded successfully!' }
                    });

                    resolve();
                },
                () => {
                    reject(new Error('Model loading cancelled'));
                },
                (message) => {
                    console.log('Model loading:', message);
                }
            );
        });

    } catch (error) {
        postMessage({
            id,
            type: 'load',
            payload: { status: 'error', error: error.message }
        });
    }
}

async function transcribeAudio(id, payload) {
    if (!isModelLoaded || !whisperInstance) {
        postMessage({
            id,
            type: 'transcribe',
            payload: { status: 'error', error: 'Model not loaded' }
        });
        return;
    }

    const { audio } = payload;

    try {
        postMessage({
            id,
            type: 'transcribe',
            payload: { status: 'progress', message: 'Processing audio...' }
        });

        // Set audio data in the WASM module
        whisperModule.set_audio(whisperInstance, audio.data);

        // Get transcription
        const transcribed = whisperModule.get_transcribed();

        postMessage({
            id,
            type: 'transcribe',
            payload: { 
                status: 'complete',
                data: { text: transcribed || '' }
            }
        });

    } catch (error) {
        postMessage({
            id,
            type: 'transcribe',
            payload: { status: 'error', error: error.message }
        });
    }
}
            var progressCur = Math.round((receivedLength / total) * 10);
            if (progressCur != progressLast) {
                cbPrint('fetchRemote: fetching ' + 10*progressCur + '% ...');
                progressLast = progressCur;
            }
        }
    }

    var position = 0;
    var chunksAll = new Uint8Array(receivedLength);

    for (var chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
    }

    return chunksAll;
}

// load remote data
// - check if the data is already in the IndexedDB
// - if not, fetch it from the remote URL and store it in the IndexedDB
function loadRemote(url, dst, size_mb, cbProgress, cbReady, cbCancel, cbPrint) {
    if (!navigator.storage || !navigator.storage.estimate) {
        cbPrint('loadRemote: navigator.storage.estimate() is not supported');
    } else {
        // query the storage quota and print it
        navigator.storage.estimate().then(function (estimate) {
            cbPrint('loadRemote: storage quota: ' + estimate.quota + ' bytes');
            cbPrint('loadRemote: storage usage: ' + estimate.usage + ' bytes');
        });
    }

    // check if the data is already in the IndexedDB
    var rq = indexedDB.open(dbName, dbVersion);

    rq.onupgradeneeded = function (event) {
        var db = event.target.result;
        if (db.version == 1) {
            var os = db.createObjectStore('models', { autoIncrement: false });
            cbPrint('loadRemote: created IndexedDB ' + db.name + ' version ' + db.version);
        } else {
            // clear the database
            var os = event.currentTarget.transaction.objectStore('models');
            os.clear();
            cbPrint('loadRemote: cleared IndexedDB ' + db.name + ' version ' + db.version);
        }
    };

    rq.onsuccess = function (event) {
        var db = event.target.result;
        var tx = db.transaction(['models'], 'readonly');
        var os = tx.objectStore('models');
        var rq = os.get(url);

        rq.onsuccess = function (event) {
            if (rq.result) {
                cbPrint('loadRemote: "' + url + '" is already in the IndexedDB');
                cbReady(dst, rq.result);
            } else {
                // data is not in the IndexedDB
                cbPrint('loadRemote: "' + url + '" is not in the IndexedDB');

                // alert and ask the user to confirm
                if (!confirm(
                    'You are about to download ' + size_mb + ' MB of data.\n' +
                    'The model data will be cached in the browser for future use.\n\n' +
                    'Press OK to continue.')) {
                    cbCancel();
                    return;
                }

                fetchRemote(url, cbProgress, cbPrint).then(function (data) {
                    if (data) {
                        // store the data in the IndexedDB
                        var rq = indexedDB.open(dbName, dbVersion);
                        rq.onsuccess = function (event) {
                            var db = event.target.result;
                            var tx = db.transaction(['models'], 'readwrite');
                            var os = tx.objectStore('models');

                            var rq = null;
                            try {
                                var rq = os.put(data, url);
                            } catch (e) {
                                cbPrint('loadRemote: failed to store "' + url + '" in the IndexedDB: \n' + e);
                                cbCancel();
                                return;
                            }

                            rq.onsuccess = function (event) {
                                cbPrint('loadRemote: "' + url + '" stored in the IndexedDB');
                                cbReady(dst, data);
                            };

                            rq.onerror = function (event) {
                                cbPrint('loadRemote: failed to store "' + url + '" in the IndexedDB');
                                cbCancel();
                            };
                        };
                    }
                });
            }
        };

        rq.onerror = function (event) {
            cbPrint('loadRemote: failed to get data from the IndexedDB');
            cbCancel();
        };
    };

    rq.onerror = function (event) {
        cbPrint('loadRemote: failed to open IndexedDB');
        cbCancel();
    };

    rq.onblocked = function (event) {
        cbPrint('loadRemote: failed to open IndexedDB: blocked');
        cbCancel();
    };

    rq.onabort = function (event) {
        cbPrint('loadRemote: failed to open IndexedDB: abort');
        cbCancel();
    };
}
