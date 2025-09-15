// Worker-specific helper functions (without DOM dependencies)

function convertTypedArray(src, type) {
    var buffer = new ArrayBuffer(src.byteLength);
    var baseView = new src.constructor(buffer).set(src);
    return new type(buffer);
}

// Worker-compatible print function (uses console instead of DOM)
var printTextarea = function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    console.log('[Worker]', text);

    // Send log messages to main thread if needed
    if (typeof postMessage === 'function') {
        try {
            postMessage({
                type: 'log',
                message: text
            });
        } catch (e) {
            // Ignore if postMessage fails
        }
    }
};

// Worker-compatible cache clear function
async function clearCache() {
    console.log('[Worker] Clear cache requested');
    // In worker context, we can't show confirm dialog
    // Just proceed with clearing
    try {
        indexedDB.deleteDatabase(dbName);
        console.log('[Worker] Cache cleared');
    } catch (e) {
        console.error('[Worker] Failed to clear cache:', e);
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
    // In worker context, we can't query storage estimate the same way
    // But we can still proceed
    cbPrint('loadRemote: starting download process...');

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

                // In worker context, we can't show confirm dialog
                // Auto-proceed with download
                cbPrint('loadRemote: Auto-downloading ' + size_mb + ' MB of data...');

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
                }).catch(function(error) {
                    cbPrint('loadRemote: fetch error: ' + error.message);
                    cbCancel();
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

// Global variables for worker context
var dbVersion = 1;
var dbName = 'whisper.ggerganov.com';
