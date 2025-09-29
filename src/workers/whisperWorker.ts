/**
 * Whisper Web Worker for WASM-based speech recognition
 */

import { getWasmUrl } from '../utils/wasmLoader';

interface WhisperMessage {
  id: number;
  type: 'load' | 'transcribe';
  payload: any;
}

interface WhisperResponse {
  id: number;
  type: 'load' | 'transcribe' | 'error';
  payload: {
    status?: 'progress' | 'complete' | 'error';
    progress?: number;
    message?: string;
    error?: string;
    data?: {
      text: string;
    };
  };
}

let wasmInstance: WebAssembly.Instance | null = null;
let isLoading = false;

// Worker message handler
self.onmessage = async (event: MessageEvent<WhisperMessage>) => {
  const { id, type, payload } = event.data;

  try {
    switch (type) {
      case 'load':
        await handleLoadModel(id, payload);
        break;
      case 'transcribe':
        await handleTranscribe(id, payload);
        break;
      default:
        sendError(id, `Unknown message type: ${type}`);
    }
  } catch (error) {
    sendError(id, `Worker error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

async function handleLoadModel(id: number, _payload: { model?: string }) {
  if (isLoading) {
    sendError(id, 'Model is already loading');
    return;
  }

  if (wasmInstance) {
    sendResponse(id, 'load', { status: 'complete', message: 'Model already loaded' });
    return;
  }

  isLoading = true;

  try {
    sendResponse(id, 'load', { status: 'progress', progress: 0, message: 'Fetching WASM module...' });

    // Get WASM URL from the loader utility
    const wasmUrl = getWasmUrl();
    const response = await fetch(wasmUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch WASM: ${response.statusText}`);
    }

    sendResponse(id, 'load', { status: 'progress', progress: 30, message: 'Compiling WASM...' });

    const wasmBytes = await response.arrayBuffer();
    const wasmModule = await WebAssembly.compile(wasmBytes);

    sendResponse(id, 'load', { status: 'progress', progress: 60, message: 'Instantiating WASM...' });

    // Create WASM instance with necessary imports
    wasmInstance = await WebAssembly.instantiate(wasmModule, {
      env: {
        memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }),
        // Add other imports required by your WASM module
      },
    });

    sendResponse(id, 'load', { status: 'progress', progress: 90, message: 'Initializing model...' });

    // Initialize the model if needed
    // This depends on your specific WASM implementation

    sendResponse(id, 'load', { status: 'complete', message: 'Model loaded successfully' });

  } catch (error) {
    sendError(id, `Failed to load model: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    isLoading = false;
  }
}

async function handleTranscribe(id: number, _payload: { audio: { sampling_rate: number; data: Float32Array }; language?: string; translate?: boolean }) {
  if (!wasmInstance) {
    sendError(id, 'Model not loaded. Please load the model first.');
    return;
  }

  try {
    // This is where you would call your WASM functions for transcription
    // The exact implementation depends on your WASM module's API

    // For now, return a placeholder response
    // You'll need to implement the actual WASM transcription calls here

    // Example: const result = wasmInstance.exports.transcribe(audioData);

    sendResponse(id, 'transcribe', {
      status: 'complete',
      data: {
        text: '[Transcription not implemented yet - WASM integration needed]'
      }
    });

  } catch (error) {
    sendError(id, `Transcription failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function sendResponse(id: number, type: 'load' | 'transcribe', payload: WhisperResponse['payload']) {
  const response: WhisperResponse = { id, type, payload };
  self.postMessage(response);
}

function sendError(id: number, error: string) {
  const response: WhisperResponse = {
    id,
    type: 'error',
    payload: { status: 'error', error }
  };
  self.postMessage(response);
}

console.log('🔧 Whisper Worker initialized with WASM support');