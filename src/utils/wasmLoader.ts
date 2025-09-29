/**
 * WASM loader utility for importing WASM files from src directory
 */

import wasmUrl from '../assets/libstream.wasm?url';

export interface WasmModule {
  instance: WebAssembly.Instance;
  module: WebAssembly.Module;
}

let wasmCache: WasmModule | null = null;

/**
 * Load WASM module from src/assets
 */
export async function loadWasm(): Promise<WasmModule> {
  if (wasmCache) {
    return wasmCache;
  }

  try {
    // Fetch WASM binary from the imported URL
    const response = await fetch(wasmUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch WASM: ${response.statusText}`);
    }

    const wasmBytes = await response.arrayBuffer();

    // Compile WASM module
    const wasmModule = await WebAssembly.compile(wasmBytes);

    // Instantiate WASM module with imports
    const wasmInstance = await WebAssembly.instantiate(wasmModule, {
      env: {
        memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }),
        // Add other imports as needed for your WASM module
      },
      // Add other import objects as needed
    });

    wasmCache = {
      instance: wasmInstance,
      module: wasmModule
    };

    console.log('✅ WASM module loaded successfully from src/assets');
    return wasmCache;

  } catch (error) {
    console.error('❌ Failed to load WASM module:', error);
    throw error;
  }
}

/**
 * Get cached WASM module (returns null if not loaded yet)
 */
export function getCachedWasm(): WasmModule | null {
  return wasmCache;
}

/**
 * Clear WASM cache (for testing or reloading)
 */
export function clearWasmCache(): void {
  wasmCache = null;
}

/**
 * Get WASM URL for use in workers
 */
export function getWasmUrl(): string {
  return wasmUrl;
}