import { useState, useEffect } from 'react';

export const useUI = () => {
  const [opacity, setOpacity] = useState(1);
  const [isMiniMode, setIsMiniMode] = useState(true);

  useEffect(() => {
    // if (isMiniMode) {
    //   window.electronAPI?.enterMiniMode();
    // } else {
    //   window.electronAPI?.enterNormalMode();
    // }
  }, [isMiniMode]);

  const handleOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseFloat(event.target.value);
    setOpacity(newOpacity);
    // if (window.electronAPI) {
    //   window.electronAPI.setOpacity(newOpacity);
    // }
  };

  const toggleMode = () => {
    setIsMiniMode(!isMiniMode);
  };

  return { opacity, isMiniMode, handleOpacityChange, toggleMode };
};
