import React from 'react';
import { Volume2 } from 'lucide-react';
import { useSounds } from '../context/SoundContext';

const BuzzerView: React.FC = () => {
  const { sounds, playSound, currentlyPlaying } = useSounds();

  if (sounds.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="mb-4 flex justify-center">
          <div className="bg-cyan-500/10 p-3 rounded-full">
            <Volume2 className="h-8 w-8 text-cyan-400" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-200 mb-1">No sounds available</h3>
        <p className="text-sm text-gray-400">
          Upload some sounds to start using the buzzer
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sounds.map(sound => (
        <button
          key={sound.id}
          onClick={() => playSound(sound.id)}
          onTouchStart={() => playSound(sound.id)}
          disabled={currentlyPlaying === sound.id}
          className={`relative p-6 rounded-xl border transition-all touch-manipulation ${
            currentlyPlaying === sound.id
              ? 'bg-pink-500/10 border-pink-500/30 shadow-pink-500/10'
              : 'bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 hover:border-gray-700 active:bg-gray-900/80'
          } shadow-lg group overflow-hidden`}
        >
          {/* Ripple effect when playing */}
          {currentlyPlaying === sound.id && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-12 h-12 bg-pink-500/20 rounded-full animate-ping" />
              <div className="absolute w-8 h-8 bg-pink-500/30 rounded-full" />
            </div>
          )}
          
          <div className="relative flex flex-col items-center">
            <div className={`mb-4 p-4 rounded-full ${
              currentlyPlaying === sound.id
                ? 'bg-pink-500/20 text-pink-400'
                : 'bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20'
            }`}>
              <Volume2 className="h-8 w-8" />
            </div>
            
            <h3 className="text-lg font-medium text-gray-200 text-center mb-1">
              {sound.name}
            </h3>
            
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>{sound.type === 'notification' ? 'Notification' : 'Music'}</span>
              <span>•</span>
              <span>{sound.schedules.length} schedule(s)</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default BuzzerView;