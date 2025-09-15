// This is a placeholder for the actual Whisper WASM module
// In a real implementation, you would need to download the actual stream.js file
// from the whisper.cpp project: https://github.com/ggerganov/whisper.cpp/tree/master/examples/stream.wasm

// For now, this provides a mock interface
const WhisperModule = {
  init: function(modelPath, language) {
    console.log('Mock: Initializing Whisper with model:', modelPath, 'language:', language);
    return 1; // Mock instance ID
  },

  set_audio: function(instance, audioData) {
    console.log('Mock: Setting audio data, length:', audioData.length);
  },

  get_transcribed: function() {
    return "안녕하세요. 이것은 테스트 음성 인식 결과입니다.";
  },

  get_status: function() {
    return "ready";
  },

  FS_unlink: function(path) {
    console.log('Mock: Unlinking file:', path);
  },

  FS_createDataFile: function(parent, name, data, canRead, canWrite) {
    console.log('Mock: Creating file:', name, 'size:', data.length);
  }
};

// Export as default for ES6 modules
export default function(config) {
  if (config.onRuntimeInitialized) {
    setTimeout(config.onRuntimeInitialized, 1000); // Mock delay
  }
  return WhisperModule;
}

// Also support CommonJS style for compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WhisperModule;
}
