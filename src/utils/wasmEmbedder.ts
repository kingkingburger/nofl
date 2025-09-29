/**
 * Utility to embed WASM binary as base64 string in JavaScript
 * This file provides tools to convert WASM binaries to base64 for embedding
 */

// Convert ArrayBuffer to base64 string
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Convert base64 string to ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    // Remove whitespace and newlines
    const cleanBase64 = base64.replace(/\s/g, '');
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Chunk base64 string for better readability in code
export function chunkBase64(base64: string, chunkSize: number = 80): string {
    const chunks = [];
    for (let i = 0; i < base64.length; i += chunkSize) {
        chunks.push(base64.substr(i, chunkSize));
    }
    return chunks.join('\n');
}

// Generate embedded WASM module template
export function generateEmbeddedModule(
    wasmBase64: string, 
    moduleName: string = 'WhisperModule'
): string {
    const chunkedBase64 = chunkBase64(wasmBase64);

    return `
// ${moduleName} with embedded WASM binary
// Generated automatically - do not edit manually

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

// Initialize embedded WASM module
async function initEmbeddedWasm() {
    const wasmBinary = base64ToArrayBuffer(WASM_BASE64);

    // Load WASM module
    const wasmModule = await WebAssembly.compile(wasmBinary);
    const wasmInstance = await WebAssembly.instantiate(wasmModule, {
        // Add WASM imports here if needed
        env: {
            memory: new WebAssembly.Memory({ initial: 256 }),
            // Add other imports as needed
        }
    });

    return wasmInstance.exports;
}

export default initEmbeddedWasm;
export { WASM_BASE64, base64ToArrayBuffer };
`;
}

// Node.js utility to read WASM file and generate embedded module
export async function embedWasmFile(
    wasmFilePath: string,
    outputPath: string,
    moduleName: string = 'WhisperModule'
): Promise<void> {
    if (typeof window !== 'undefined') {
        throw new Error('This function is for Node.js environment only');
    }

    try {
        // This function is designed for Node.js scripts, not for browser builds
        // It should only be called from separate Node.js scripts
        const fs = eval('require("fs")');

        // Read WASM file
        const wasmBuffer = fs.readFileSync(wasmFilePath);
        const wasmBase64 = wasmBuffer.toString('base64');

        // Generate embedded module
        const embeddedModule = generateEmbeddedModule(wasmBase64, moduleName);

        // Write to output file
        fs.writeFileSync(outputPath, embeddedModule);

        console.log(`✅ WASM file embedded successfully:`);
        console.log(`   Input: ${wasmFilePath}`);
        console.log(`   Output: ${outputPath}`);
        console.log(`   Size: ${Math.round(wasmBuffer.length / 1024)} KB`);
        console.log(`   Base64 size: ${Math.round(wasmBase64.length / 1024)} KB`);

    } catch (error) {
        console.error('❌ Error embedding WASM file:', error);
        throw error;
    }
}

// Browser utility to convert File object to base64
export async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
