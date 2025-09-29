import React, { useState } from 'react';
import { loadWasm, getWasmUrl } from '../utils/wasmLoader';

export const WasmTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to test');
  const [wasmUrl, setWasmUrl] = useState<string>('');

  const testWasmUrl = () => {
    try {
      const url = getWasmUrl();
      setWasmUrl(url);
      setStatus(`✅ WASM URL generated: ${url}`);
    } catch (error) {
      setStatus(`❌ Failed to get WASM URL: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testWasmLoading = async () => {
    setStatus('🔄 Loading WASM module...');
    try {
      const wasmModule = await loadWasm();
      setStatus(`✅ WASM module loaded successfully! Instance: ${wasmModule.instance !== null}`);
    } catch (error) {
      setStatus(`❌ WASM loading failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>WASM Loading Test</h3>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={testWasmUrl} style={{ marginRight: '10px', padding: '8px 16px' }}>
          Test WASM URL
        </button>
        <button onClick={testWasmLoading} style={{ padding: '8px 16px' }}>
          Test WASM Loading
        </button>
      </div>

      <div style={{
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '14px',
        minHeight: '50px'
      }}>
        <strong>Status:</strong> {status}
      </div>

      {wasmUrl && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#e8f4f8',
          borderRadius: '4px',
          fontSize: '12px',
          wordBreak: 'break-all'
        }}>
          <strong>WASM URL:</strong> {wasmUrl}
        </div>
      )}
    </div>
  );
};