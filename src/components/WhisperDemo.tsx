import React, { useState } from 'react';
import { useWhisper } from '../hooks/useWhisper';

const WhisperDemo: React.FC = () => {
  const {
    isModelLoading,
    isReady,
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    loadingProgress
  } = useWhisper();

  const [selectedModel, setSelectedModel] = useState('ggml-base.bin');

  const modelOptions = [
    { value: 'ggml-tiny.en.bin', label: 'Tiny EN (75MB)' },
    { value: 'ggml-base.en.bin', label: 'Base EN (142MB)' },
    { value: 'ggml-base.bin', label: 'Base (142MB)' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Whisper.cpp WebAssembly 음성 인식
        </h1>

        {/* 모델 선택 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">모델 선택</h2>
          <div className="flex flex-wrap gap-2">
            {modelOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedModel(option.value)}
                disabled={isModelLoading}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedModel === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 모델 로딩 상태 */}
        {isModelLoading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <p className="text-blue-800 font-medium">모델을 로딩하고 있습니다...</p>
                {loadingProgress !== null && (
                  <div className="mt-2">
                    <div className="bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${loadingProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">{loadingProgress.toFixed(0)}%</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              <span className="font-medium">오류:</span> {error}
            </p>
          </div>
        )}

        {/* 녹음 컨트롤 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">음성 녹음</h2>
          <div className="flex space-x-4">
            <button
              onClick={startRecording}
              disabled={!isReady || isRecording || isModelLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isRecording
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isReady
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
              }`}
            >
              {isRecording ? '녹음 중...' : '녹음 시작'}
            </button>

            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
              }`}
            >
              녹음 중지
            </button>
          </div>

          {isRecording && (
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 font-medium">녹음 중입니다...</span>
            </div>
          )}
        </div>

        {/* 상태 표시 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">상태</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">모델 상태</p>
              <p className={`font-medium ${
                isReady ? 'text-green-600' : isModelLoading ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {isReady ? '준비됨' : isModelLoading ? '로딩 중' : '대기 중'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">녹음 상태</p>
              <p className={`font-medium ${
                isRecording ? 'text-red-600' : 'text-gray-600'
              }`}>
                {isRecording ? '녹음 중' : '대기 중'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">선택된 모델</p>
              <p className="font-medium text-gray-800">{selectedModel}</p>
            </div>
          </div>
        </div>

        {/* 음성 인식 결과 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">음성 인식 결과</h2>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-24">
            {transcript ? (
              <p className="text-gray-800 leading-relaxed">{transcript}</p>
            ) : (
              <p className="text-gray-500 italic">
                {isReady ? '음성을 녹음하여 텍스트로 변환해보세요.' : '모델을 로드해주세요.'}
              </p>
            )}
          </div>
        </div>

        {/* 사용 방법 */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">사용 방법</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>위에서 원하는 Whisper 모델을 선택하세요.</li>
            <li>모델 로딩이 완료될 때까지 기다리세요.</li>
            <li>"녹음 시작" 버튼을 클릭하여 음성 녹음을 시작하세요.</li>
            <li>말씀하신 후 "녹음 중지" 버튼을 클릭하세요.</li>
            <li>음성이 자동으로 텍스트로 변환됩니다.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default WhisperDemo;
