/// <reference types="vite/client" />

// Add support for WASM file imports
declare module '*.wasm' {
  const wasmUrl: string;
  export default wasmUrl;
}

declare module '*.wasm?url' {
  const wasmUrl: string;
  export default wasmUrl;
}
