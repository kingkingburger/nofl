import { useEffect } from 'react';
import TimerDashboard from './components/TimerDashboard';
import ControlPanel from './components/ControlPanel';
import Header from './components/Header';
import Footer from './components/Footer';
import { useTimer } from './hooks/useTimer';
import { useUI } from './hooks/useUI';
import { FaWindowMinimize, FaWindowMaximize } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();
  const { timers, toggleRecognition, isRecognizing } = useTimer();
  const { opacity, isMiniMode, handleOpacityChange, toggleMode } = useUI();

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen relative z-0 animate-fade-in ${isMiniMode ? 'p-2 bg-transparent mini-mode' : 'p-8 bg-gray-900 normal-mode'}`}>
      <div className="fixed top-0 left-0 w-full h-8 -webkit-app-region-drag z-50"></div>

      {!isMiniMode && <Header />}

      <main className="w-full max-w-6xl relative z-10">
        <TimerDashboard timers={timers} />
        <ControlPanel isRecognizing={isRecognizing} onToggle={toggleRecognition} />
        {!isMiniMode && (
          <CommandEditor
            commands={commands}
            onAddCommand={handleAddCommand}
            onRemoveCommand={handleRemoveCommand}
          />
        )}
      </main>

      {!isMiniMode && <Footer opacity={opacity} onOpacityChange={handleOpacityChange} />}

      <button 
        onClick={toggleMode} 
        className="fixed top-2 right-2 z-50 p-2 bg-gray-700 rounded-full text-white hover:bg-gray-600 transition-colors"
        title={isMiniMode ? t('normal_mode') : t('mini_mode')}
      >
        {isMiniMode ? <FaWindowMaximize /> : <FaWindowMinimize />}
      </button>
    </div>
  );
}

export default App;
