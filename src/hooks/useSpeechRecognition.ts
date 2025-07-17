import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * @description Defines the structure for the props of the useSpeechRecognition hook.
 */
interface SpeechRecognitionHookProps {
  onCommand: (lane: string) => void; // Callback function to execute when a command is recognized.
}

// Extend the global Window interface to include the webkitSpeechRecognition class.
// This is necessary because the Speech Recognition API is still vendor-prefixed in some browsers.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

/**
 * @description A custom hook to handle speech recognition for game commands.
 * This hook encapsulates the logic for initializing, starting, and stopping the speech recognition service.
 * It listens for specific keywords and triggers a callback function when a valid command is detected.
 *
 * @param {SpeechRecognitionHookProps} props The properties for the hook, including the command handler.
 * @returns An object containing the listening state and functions to control the recognition.
 */
export const useSpeechRecognition = ({ onCommand }: SpeechRecognitionHookProps) => {
  const [isListening, setIsListening] = useState(false);
  // Use useRef to store the recognition instance so it persists across renders
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isAPIAvailable, setIsAPIAvailable] = useState(false);

  useEffect(() => {
    // Check if the Speech Recognition API is available in the current browser environment.
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      setIsAPIAvailable(true);

      // Configure the speech recognition instance.
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true; // Keep listening even after a result is returned.
        recognitionRef.current.lang = 'ko-KR'; // Set the language to Korean.
        recognitionRef.current.interimResults = false; // We only want final results.

        // Event handler for when a speech recognition result is available.
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[event.results.length - 1][0].transcript.trim();
          const lanes = ['탑', '정글', '미드', '원딜', '서폿'];

          // Check if the transcript includes a valid lane and the "노플" command.
          for (const lane of lanes) {
            if (transcript.includes(lane) && transcript.includes('노플')) {
              onCommand(lane); // Execute the callback with the detected lane.
              break; // Stop checking once a command is found.
            }
          }
        };

        // Event handler for errors during speech recognition.
        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false); // Stop listening on error
        };

        // Event handler for when the speech recognition service has disconnected.
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    } else {
      // If the API is not supported, log a warning and set API availability to false.
      console.warn('Speech Recognition API not supported in this browser.');
      setIsAPIAvailable(false);
    }

    // Cleanup function: Ensure recognition is stopped when the component unmounts.
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onCommand]); // `onCommand` is a dependency because it's used inside the effect.

  /**
   * @description Starts the speech recognition service.
   */
  const startListening = useCallback(() => {
    if (recognitionRef.current && isAPIAvailable) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      console.warn('Cannot start listening: Speech Recognition API not available or not initialized.');
    }
  }, [isAPIAvailable]);

  /**
   * @description Stops the speech recognition service.
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  }, []);

  return { isListening, startListening, stopListening, isAPIAvailable };
};