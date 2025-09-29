import wasmUrl from '../assets/libstream.wasm?url';

export interface WasmModule {
  instance: WebAssembly.Instance;
  module: WebAssembly.Module;
}

let wasmCache: WasmModule | null = null;

export async function loadWasm(): Promise<WasmModule> {
  if (wasmCache) {
    return wasmCache;
  }

  try {
    const response = await fetch(wasmUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch WASM: ${response.statusText}`);
    }

    const wasmBytes = await response.arrayBuffer();
    const wasmModule = await WebAssembly.compile(wasmBytes);

    // WASM이 요구하는 모든 import를 포함하는 객체
    const importObject = {
      a: {
        // 1. 메모리 제공 ('name': 'a', 'kind': 'memory')
        a: new WebAssembly.Memory({ initial: 256, maximum: 512 }),

        // 2. 모든 필수 함수들에 대한 placeholder 구현
        // ⚠️ 중요: 이 함수들은 실제 기능으로 대체해야 합니다.
        b: (...args: any[]) => console.log('WASM called function "b"', ...args),
        c: (...args: any[]) => console.log('WASM called function "c"', ...args),
        d: (...args: any[]) => console.log('WASM called function "d"', ...args),
        e: (...args: any[]) => console.log('WASM called function "e"', ...args),
        f: (...args: any[]) => console.log('WASM called function "f"', ...args),
        g: (...args: any[]) => console.log('WASM called function "g"', ...args),
        h: (...args: any[]) => console.log('WASM called function "h"', ...args),
        i: (...args: any[]) => console.log('WASM called function "i"', ...args),
        j: (...args: any[]) => console.log('WASM called function "j"', ...args),
        k: (...args: any[]) => console.log('WASM called function "k"', ...args),
        l: (...args: any[]) => console.log('WASM called function "l"', ...args),
        m: (...args: any[]) => console.log('WASM called function "m"', ...args),
        n: (...args: any[]) => console.log('WASM called function "n"', ...args),
        o: (...args: any[]) => console.log('WASM called function "o"', ...args),
        p: (...args: any[]) => console.log('WASM called function "p"', ...args),
        q: (...args: any[]) => console.log('WASM called function "q"', ...args),
        r: (...args: any[]) => console.log('WASM called function "r"', ...args),
        s: (...args: any[]) => console.log('WASM called function "s"', ...args),
        t: (...args: any[]) => console.log('WASM called function "t"', ...args),
        u: (...args: any[]) => console.log('WASM called function "u"', ...args),
        v: (...args: any[]) => console.log('WASM called function "v"', ...args),
        w: (...args: any[]) => console.log('WASM called function "w"', ...args),
        x: (...args: any[]) => console.log('WASM called function "x"', ...args),
        y: (...args: any[]) => console.log('WASM called function "y"', ...args),
        z: (...args: any[]) => console.log('WASM called function "z"', ...args),
        A: (...args: any[]) => console.log('WASM called function "A"', ...args),
        B: (...args: any[]) => console.log('WASM called function "B"', ...args),
        C: (...args: any[]) => console.log('WASM called function "C"', ...args),
        D: (...args: any[]) => console.log('WASM called function "D"', ...args),
        E: (...args: any[]) => console.log('WASM called function "E"', ...args),
        F: (...args: any[]) => console.log('WASM called function "F"', ...args),
        G: (...args: any[]) => console.log('WASM called function "G"', ...args),
        H: (...args: any[]) => console.log('WASM called function "H"', ...args),
        I: (...args: any[]) => console.log('WASM called function "I"', ...args),
        J: (...args: any[]) => console.log('WASM called function "J"', ...args),
        K: (...args: any[]) => console.log('WASM called function "K"', ...args),
        L: (...args: any[]) => console.log('WASM called function "L"', ...args),
        M: (...args: any[]) => console.log('WASM called function "M"', ...args),
        N: (...args: any[]) => console.log('WASM called function "N"', ...args),
        O: (...args: any[]) => console.log('WASM called function "O"', ...args),
        P: (...args: any[]) => console.log('WASM called function "P"', ...args),
        Q: (...args: any[]) => console.log('WASM called function "Q"', ...args),
        R: (...args: any[]) => console.log('WASM called function "R"', ...args),
        S: (...args: any[]) => console.log('WASM called function "S"', ...args),
        T: (...args: any[]) => console.log('WASM called function "T"', ...args),
      }
    };

    // 준비된 import 객체를 사용하여 WASM 모듈을 인스턴스화합니다.
    const wasmInstance = await WebAssembly.instantiate(wasmModule, importObject);

    wasmCache = {
      instance: wasmInstance,
      module: wasmModule
    };

    console.log('✅ WASM module loaded and instantiated successfully!');
    return wasmCache;

  } catch (error) {
    console.error('❌ Failed to load WASM module:', error);
    throw error;
  }
}

/**
 * Get WASM URL for use in workers
 */
export function getWasmUrl(): string {
  return wasmUrl;
}