import React, { useState, useEffect } from 'react';
import { GripHorizontal, Star, Clock, Play, Pause, Music, Settings } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { useSounds } from '../context/SoundContext';
import { Sound } from '../types';
import { formatDuration } from '../utils/helpers';
import { API_BASE } from '../lib/api';
import CategoryManagerModal from './CategoryManagerModal';

const SoundboardView: React.FC = () => {
  const { 
    sounds: originalSounds, 
    playSound,
    pauseSound,
    currentlyPlaying,
    categories,
    toggleFavorite,
    currentTimeSeconds,
    updateSoundOrder
  } = useSounds();
  
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [filterCat, setFilterCat] = useState<string>('');
  const [catOpen, setCatOpen] = useState<boolean>(false);

  // Derive a stable color from a string (category id or name)
  const colorFor = (key: string | undefined): string => {
    if (!key) return '#9ca3af'; // neutral gray fallback
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    const hue = hash % 360;
    const sat = 65; // percent
    const light = 55; // percent
    return `hsl(${hue} ${sat}% ${light}%)`;
  };

  useEffect(() => {
    const sortedSounds = [...originalSounds].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return (a.order || 0) - (b.order || 0);
    });
    setSounds(sortedSounds);
  }, [originalSounds]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sounds);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setSounds(updatedItems);
    await updateSoundOrder(updatedItems);
  };

  if (sounds.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="mb-4 flex justify-center">
          <div className="bg-[#4ECBD9]/10 p-3 rounded-full">
            <Music className="h-8 w-8 text-[#4ECBD9]" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-[#C1C2C5] mb-1">Keine Sounds</h3>
        <p className="text-sm text-[#909296]">
          Lade Audiodateien hoch, um sie im Soundboard zu verwenden
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filter & Settings */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCat('')}
            className={`px-3 py-1.5 rounded-full text-xs border ${filterCat === '' ? 'bg-[#4ECBD9]/10 text-[#4ECBD9] border-[#4ECBD9]/30' : 'bg-neutral-800 text-[#C1C2C5] border-neutral-700 hover:bg-neutral-700'}`}
          >
            Alle
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs border ${filterCat === c.id ? 'bg-[#4ECBD9]/10 text-[#4ECBD9] border-[#4ECBD9]/30' : 'bg-neutral-800 text-[#C1C2C5] border-neutral-700 hover:bg-neutral-700'}`}
            >
              <span className="inline-flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorFor(c.id || c.name) }} />
                {c.name}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setCatOpen(true)}
          className="p-2 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-700/50"
          title="Kategorien verwalten"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="soundboard">
        {(provided: DroppableProvided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {sounds
              .filter(s => !filterCat || s.categoryId === filterCat)
              .map((sound, index) => (
              <Draggable key={sound.id} draggableId={sound.id} index={index}>
                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-white/20 transition-all shadow-lg touch-manipulation ${
                       currentlyPlaying === sound.id
                         ? 'ring-1 ring-[#4ECBD9] shadow-[#4ECBD9]/10'
                         : snapshot.isDragging
                         ? 'ring-1 ring-[#4ECBD9]/50 rotate-2 shadow-xl'
                         : ''
                      }`}
                    style={{ ...(provided.draggableProps.style || {}) }}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <button
                          onClick={() => toggleFavorite(sound.id)}
                          onTouchStart={() => toggleFavorite(sound.id)}
                          className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
                        >
                          <Star 
                            className={`h-4 w-4 ${
                              sound.isFavorite 
                                ? 'fill-[#F471B5] text-[#F471B5]' 
                                : 'text-[#909296] hover:text-[#C1C2C5]'
                            }`} 
                          />
                        </button>
                        
                        <div
                          {...provided.dragHandleProps}
                          className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
                        >
                          <GripHorizontal className="h-4 w-4 text-[#909296]" />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (currentlyPlaying === sound.id) {
                            // Pause acts as Stop (reset)
                            pauseSound();
                          } else {
                            playSound(sound.id);
                          }
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          if (currentlyPlaying === sound.id) {
                            pauseSound();
                          } else {
                            playSound(sound.id);
                          }
                        }}
                        className="w-full text-left focus:outline-none group"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex-none w-12 h-12 rounded-md overflow-hidden bg-black/30">
                                <img
                                  src={`${API_BASE}/cover.php?file=${encodeURIComponent((sound.url || '').split('/').pop() || '')}`}
                                  alt="cover"
                                  className="block w-full h-full object-cover hidden"
                                  onLoad={(e) => {
                                    e.currentTarget.classList.remove('hidden');
                                  }}
                                  onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                              </div>
                            </div>
                            <div className="ml-3 flex items-center">
                              <div className={`p-2 rounded-full transition-colors ${
                                currentlyPlaying === sound.id
                                  ? 'bg-[#4ECBD9]/20 text-[#4ECBD9]'
                                  : 'bg-[#4ECBD9]/10 text-[#4ECBD9] group-hover:bg-[#4ECBD9]/20'
                              }`}>
                                {currentlyPlaying === sound.id ? (
                                  <Pause className="h-5 w-5" />
                                ) : (
                                  <Play className="h-5 w-5" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Progress bar under the play button */}
                          {(() => {
                            const progress = (currentlyPlaying === sound.id && sound.duration > 0)
                              ? Math.max(0, Math.min(100, (currentTimeSeconds / sound.duration) * 100))
                              : 0;
                            return (
                              <div className="mt-2 h-1 w-full bg-neutral-700/60 rounded overflow-hidden">
                                <div
                                  className="h-full bg-[#4ECBD9]"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            );
                          })()}

                          <div className="mt-3 border-t border-neutral-700/50" />

                          <div className="pt-3">
                            <h3 className="text-sm font-medium text-[#C1C2C5] truncate">
                              {sound.name}
                            </h3>
                            {sound.categoryId && (
                              <div className="text-[10px] text-[#909296] mt-0.5 flex items-center gap-1.5">
                                <span
                                  className="inline-block w-2 h-2 rounded-full"
                                  style={{ backgroundColor: colorFor(sound.categoryId) }}
                                />
                                <span>
                                  {categories.find(c => c.id === sound.categoryId)?.name}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="h-3 w-3 text-[#909296]" />
                              <p className="text-xs text-[#909296]">
                                {formatDuration(sound.duration)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>

                      {currentlyPlaying === sound.id && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute inset-0 bg-[#4ECBD9]/5 animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>

    <CategoryManagerModal open={catOpen} onClose={() => setCatOpen(false)} />
    </>
  );
}
;

export default SoundboardView;