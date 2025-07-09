
import React, { useState } from 'react';
import type { Command } from '../types/types';

interface CommandEditorProps {
  commands: Command[];
  onAddCommand: (command: Command) => void;
  onRemoveCommand: (commandId: string) => void;
}

const CommandEditor: React.FC<CommandEditorProps> = ({ commands, onAddCommand, onRemoveCommand }) => {
  const [newCommand, setNewCommand] = useState('');
  const [newLane, setNewLane] = useState('');

  const handleAddCommand = () => {
    if (newCommand.trim() && newLane.trim()) {
      onAddCommand({
        id: Date.now().toString(),
        phrase: newCommand.trim(),
        lane: newLane.trim(),
      });
      setNewCommand('');
      setNewLane('');
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">음성 명령어 설정</h2>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={newCommand}
          onChange={(e) => setNewCommand(e.target.value)}
          placeholder="새 명령어 (예: '탑 노플')"
          className="flex-grow p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="text"
          value={newLane}
          onChange={(e) => setNewLane(e.target.value)}
          placeholder="레인 이름 (예: 'Top')"
          className="flex-grow p-2 rounded bg-gray-700 text-white"
        />
        <button
          onClick={handleAddCommand}
          className="px-4 py-2 bg-accent text-dark-bg rounded hover:bg-accent-dark"
        >
          추가
        </button>
      </div>
      <ul>
        {commands.map((command) => (
          <li key={command.id} className="flex justify-between items-center p-2 bg-gray-700 rounded mb-2">
            <span className="text-white">{`'${command.phrase}' -> ${command.lane}`}</span>
            <button
              onClick={() => onRemoveCommand(command.id)}
              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommandEditor;
