#!/usr/bin/env node

/**
 * Script to embed WASM binary as base64 in JavaScript files
 * Usage: node scripts/embed-wasm.js <input.wasm> <output.js>
 */

const fs = require('fs');
const path = require('path');

// Convert ArrayBuffer to base64 string
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return Buffer.from(binary, 'binary').toString('base64');
}

// Chunk base64 string for better readability
function chunkBase64(base64, chunkSize = 80) {
    const chunks = [];
    for (let i = 0; i < base64.length; i += chunkSize) {
        chunks.push(base64.substr(i, chunkSize));
    }
    return chunks.join('\n');
}

// Generate embedded WASM module
function generateEmbeddedModule(wasmBase64, moduleName = 'WhisperModule') {
    const chunkedBase64 = chunkBase64(wasmBase64);

    return `// ${moduleName} with embedded WASM binary
// Generated automatically on ${new Date().toISOString()}

const WASM_BASE64 = \`${chunkedBase64}\`;

// Decode base64 WASM binary
function base64ToArrayBuffer(base64) {
    const cleanBase64 = base64.replace(/\\s/g, '');
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

let wasmModule = null;
let wasmInstance = null;
let isInitialized = false;

// Whisper Module API
const ${moduleName} = {
    // Initialize the embedded WASM module
    async initialize() {
        if (isInitialized) return true;

        try {
            console.log('Initializing embedded WASM module...');
            const wasmBinary = base64ToArrayBuffer(WASM_BASE64);

            // Compile and instantiate WASM module
            wasmModule = await WebAssembly.compile(wasmBinary);
            wasmInstance = await WebAssembly.instantiate(wasmModule, {
                env: {
                    memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }),
                    __memory_base: 0,
                    __table_base: 0,
                    abort: () => { throw new Error('WASM abort'); },
                    // Add other imports as needed
                }
            });

            isInitialized = true;
            console.log('WASM module initialized successfully');

            if (this.onRuntimeInitialized) {
                this.onRuntimeInitialized();
            }

            return true;
        } catch (error) {
            console.error('Failed to initialize WASM module:', error);
            return false;
        }
    },

    // Whisper API functions (mock implementation)
    init: function(modelPath, language) {
        if (!isInitialized) {
            console.error('Module not initialized');
            return null;
        }
        console.log('Initializing Whisper with model:', modelPath, 'language:', language);
        return 1; // Mock instance ID
    },

    set_audio: function(instance, audioData) {
        if (!isInitialized) return;
        console.log('Setting audio data, length:', audioData.length);
    },

    get_transcribed: function() {
        if (!isInitialized) return "";
        return "This is a test transcription from embedded WASM.";
    },

    get_status: function() {
        return isInitialized ? "ready" : "initializing";
    },

    set_status: function(status) {
        console.log('Status:', status);
    },

    // File system operations (mock)
    FS_unlink: function(path) {
        console.log('Mock: Unlinking file:', path);
    },

    FS_createDataFile: function(parent, name, data, canRead, canWrite) {
        console.log('Mock: Creating file:', name, 'size:', data ? data.length : 0);
    },

    // Module configuration
    onRuntimeInitialized: null
};

// Module factory function
function createWhisperModule(config = {}) {
    Object.assign(${moduleName}, config);

    if (config.autoInit !== false) {
        ${moduleName}.initialize().then(() => {
            if (config.onRuntimeInitialized) {
                config.onRuntimeInitialized();
            }
        });
    }

    return ${moduleName};
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = createWhisperModule;
    module.exports.${moduleName} = ${moduleName};
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return createWhisperModule; });
} else if (typeof window !== 'undefined') {
    window.${moduleName} = ${moduleName};
    window.createWhisperModule = createWhisperModule;
}

// ES6 module export (if supported)
if (typeof export !== 'undefined') {
    export default createWhisperModule;
    export { ${moduleName} };
}
`;
}

// Main function
function embedWasm(inputPath, outputPath, moduleName = 'WhisperModule') {
    try {
        // Check if input file exists
        if (!fs.existsSync(inputPath)) {
            console.error(`❌ Input file not found: ${inputPath}`);
            process.exit(1);
        }

        // Read WASM file
        console.log(`📖 Reading WASM file: ${inputPath}`);
        const wasmBuffer = fs.readFileSync(inputPath);
        const wasmBase64 = wasmBuffer.toString('base64');

        // Generate embedded module
        console.log(`🔧 Generating embedded module...`);
        const embeddedModule = generateEmbeddedModule(wasmBase64, moduleName);

        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write to output file
        fs.writeFileSync(outputPath, embeddedModule);

        console.log(`✅ WASM file embedded successfully:`);
        console.log(`   Input: ${inputPath}`);
        console.log(`   Output: ${outputPath}`);
        console.log(`   Original size: ${Math.round(wasmBuffer.length / 1024)} KB`);
        console.log(`   Base64 size: ${Math.round(wasmBase64.length / 1024)} KB`);
        console.log(`   Final JS size: ${Math.round(embeddedModule.length / 1024)} KB`);

    } catch (error) {
        console.error('❌ Error embedding WASM file:', error.message);
        process.exit(1);
    }
}

// Command line interface
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('Usage: node embed-wasm.js <input.wasm> <output.js> [moduleName]');
        console.log('');
        console.log('Example:');
        console.log('  node embed-wasm.js stream.wasm public/whisper/stream-embedded.js WhisperModule');
        process.exit(1);
    }

    const [inputPath, outputPath, moduleName] = args;
    embedWasm(inputPath, outputPath, moduleName);
}

module.exports = { embedWasm, generateEmbeddedModule, arrayBufferToBase64, chunkBase64 };
