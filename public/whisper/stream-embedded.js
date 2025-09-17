// Whisper.cpp WebAssembly Module with Embedded WASM Binary
// The WASM module is embedded in the main JS file as a base64 encoded string.

// Base64 encoded WASM binary (placeholder - replace with actual WASM binary)
const WASM_BASE64 = `
// This is a placeholder for the actual base64 encoded WASM binary
// To generate the real base64 string, you would:
// 1. Get the actual stream.wasm file from whisper.cpp
// 2. Convert it to base64: base64 stream.wasm > wasm.base64
// 3. Replace this placeholder with the actual base64 content
UEsDBBQAAAAIAA0AAAA+AAAABQAAAGhlbGxv9jFLw0AMhV9kfpd+gXhQPPgBOjg4ODg4ODg4ODg4
ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4
ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4
ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4
ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4
ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4
ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4
ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4
`;

// Decode base64 WASM binary
function base64ToArrayBuffer(base64) {
    // Remove whitespace and newlines
    const cleanBase64 = base64.replace(/\s/g, '');
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Global variables for the module
let Module = {};
let wasmBinary = null;
let instance = null;
let isInitialized = false;

// Mock Whisper Module implementation with embedded WASM
const WhisperModule = {
    // Module initialization
    onRuntimeInitialized: null,

    // Initialize the module with embedded WASM
    async initialize() {
        try {
            console.log('Initializing embedded Whisper WASM module...');

            // Decode the embedded WASM binary
            wasmBinary = base64ToArrayBuffer(WASM_BASE64);

            // Create WASM instance (mock implementation)
            // In a real implementation, you would use WebAssembly.instantiate
            await new Promise((resolve) => {
                setTimeout(() => {
                    isInitialized = true;
                    console.log('WASM module initialized successfully');
                    if (this.onRuntimeInitialized) {
                        this.onRuntimeInitialized();
                    }
                    resolve();
                }, 500); // Mock delay
            });

            return true;
        } catch (error) {
            console.error('Failed to initialize WASM module:', error);
            return false;
        }
    },

    // Whisper API functions
    init: function(modelPath, language) {
        if (!isInitialized) {
            console.error('Module not initialized');
            return null;
        }
        console.log('Mock: Initializing Whisper with model:', modelPath, 'language:', language);
        instance = { id: 1, model: modelPath, language: language };
        return instance.id;
    },

    set_audio: function(instanceId, audioData) {
        if (!isInitialized || !instance) {
            console.error('Module or instance not ready');
            return;
        }
        console.log('Mock: Setting audio data, length:', audioData.length);
        // Store audio data in instance for processing
        instance.audioData = audioData;
    },

    get_transcribed: function() {
        if (!isInitialized || !instance || !instance.audioData) {
            return "";
        }

        // Mock transcription based on language
        const mockTranscriptions = {
            'ko': "안녕하세요. 이것은 한국어 음성 인식 테스트입니다.",
            'en': "Hello. This is an English speech recognition test.",
            'ja': "こんにちは。これは日本語の音声認識テストです。",
            'auto': "This is a test transcription from embedded WASM."
        };

        const language = instance.language || 'auto';
        return mockTranscriptions[language] || mockTranscriptions['auto'];
    },

    get_status: function() {
        return isInitialized ? "ready" : "initializing";
    },

    set_status: function(status) {
        console.log('Status:', status);
    },

    // File system operations
    FS_unlink: function(path) {
        console.log('Mock: Unlinking file:', path);
    },

    FS_createDataFile: function(parent, name, data, canRead, canWrite) {
        console.log('Mock: Creating file:', name, 'size:', data ? data.length : 0);
        // In a real implementation, this would store the model file in WASM memory
    },

    // Memory management
    _malloc: function(size) {
        console.log('Mock: Allocating memory:', size);
        return new ArrayBuffer(size);
    },

    _free: function(ptr) {
        console.log('Mock: Freeing memory');
    },

    // Utility functions
    convertTypedArray: function(src, type) {
        const buffer = new ArrayBuffer(src.byteLength);
        new src.constructor(buffer).set(src);
        return new type(buffer);
    }
};

// Module factory function
function createWhisperModule(config = {}) {
    // Apply configuration
    Object.assign(WhisperModule, config);

    // Auto-initialize if requested
    if (config.autoInit !== false) {
        WhisperModule.initialize().then(() => {
            if (config.onRuntimeInitialized) {
                config.onRuntimeInitialized();
            }
        });
    }

    return WhisperModule;
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    // CommonJS
    module.exports = createWhisperModule;
    module.exports.WhisperModule = WhisperModule;
} else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function() { return createWhisperModule; });
} else if (typeof window !== 'undefined') {
    // Browser global (main thread)
    window.WhisperModule = WhisperModule;
    window.createWhisperModule = createWhisperModule;
} else if (typeof self !== 'undefined') {
    // Worker global
    self.WhisperModule = WhisperModule;
    self.createWhisperModule = createWhisperModule;
}

// ES6 module export (if supported)
if (typeof export !== 'undefined') {
    export default createWhisperModule;
    export { WhisperModule };
}
