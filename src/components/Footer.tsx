import React from 'react';
import { FaSun } from 'react-icons/fa';

interface FooterProps {
  opacity: number;
  onOpacityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Footer: React.FC<FooterProps> = ({ opacity, onOpacityChange }) => {
  return (
    <footer className="fixed bottom-5 left-1/2 -translate-x-1/2 w-80 z-40">
      <div className="flex items-center gap-4 bg-dark-surface bg-opacity-80 p-3 rounded-full shadow-3xl backdrop-blur-md border border-gray-700">
        <FaSun className="text-xl text-secondary-text" />
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={opacity}
          onChange={onOpacityChange}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </footer>
  );
};

export default Footer;
