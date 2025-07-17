import React, { useRef } from 'react';
import { Timer } from './components/Timer';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';

/**
 * @description The main application component.
 * This component orchestrates the entire application, integrating the Timer components
 * for each lane and the speech recognition functionality to control them.
 * It serves as the central hub of the user interface.
 */
const App: React.FC = () => {
  // An object to hold references to each Timer component's control functions.
  // This allows the parent App component to trigger actions on child Timer components.
  const timerRefs = {
    '탑': useRef<any>(null),
    '정글': useRef<any>(null),
    '미드': useRef<any>(null),
    '원딜': useRef<any>(null),
    '서폿': useRef<any>(null),
  };

  /**
   * @description Callback function that is executed when a speech command is recognized.
   * It finds the corresponding timer reference and calls its start function.
   * @param {string} lane The lane name recognized from the speech command.
   */
  const handleCommand = (lane: string) => {
    const timerRef = timerRefs[lane as keyof typeof timerRefs];
    if (timerRef.current) {
      timerRef.current.startTimer();
    }
  };

  // Initialize the speech recognition hook.
  const { isListening, startListening, stopListening, isAPIAvailable } = useSpeechRecognition({ onCommand: handleCommand });

  // An array defining the lanes to be displayed.
  // This makes it easy to add or remove lanes in the future.
  const lanes = ['탑', '정글', '미드', '원딜', '서폿'];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 font-sans">
      <header className="w-full max-w-2xl mb-8 text-center">
        <h1 className="text-5xl font-bold text-yellow-500 tracking-wider">LoL Flash Timer</h1>
        <p className="text-gray-400 mt-2">Say "[Lane Name] no flash" to start the timer.</p>
      </header>

      <main className="w-full max-w-2xl space-y-4">
        {/* Map over the lanes array to render a Timer component for each one. */}
        {lanes.map((lane) => (
          <Timer
            key={lane}
            lane={lane}
            initialTime={300} // 5 minutes in seconds
            ref={timerRefs[lane as keyof typeof timerRefs]} // Assign the ref to the component
          />
        ))}
      </main>

      <footer className="mt-8">
        {!isAPIAvailable && (
          <p className="text-center text-red-500 mb-4">Speech Recognition API is not supported in your browser.</p>
        )}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={!isAPIAvailable} // Disable button if API is not available
          className={`px-8 py-4 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 ${
            isListening
              ? 'bg-red-700 hover:bg-red-800 shadow-lg'
              : 'bg-green-600 hover:bg-green-700 shadow-md'
          } ${
            !isAPIAvailable ? 'opacity-50 cursor-not-allowed' : ''
          }`}>
          {isListening ? 'Stop Listening' : 'Start Voice Command'}
        </button>
        {isListening && <p className="text-center mt-4 text-green-400 animate-pulse">Listening...</p>}
      </footer>
    </div>
  );
};

export default App;
