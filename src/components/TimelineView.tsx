import React, { useState, useMemo } from 'react';
import { Clock, Play, Pause, VolumeX, Volume1, Plus, Star, X } from 'lucide-react';
import { useSounds } from '../context/SoundContext';
import { formatTime, formatDuration } from '../utils/helpers';
import { API_BASE } from '../lib/api';

const SCHEDULE_SEGMENTS = [
  { id: 'open', title: 'Vor der Session', time: '-18:00:00', startTime: '00:00:00', endTime: '18:00:00' },
  { id: 'soundcheck', title: 'Ankommen & Soundcheck', time: '18:00:00-18:30:00', startTime: '18:00:00', endTime: '18:30:00' },
  { id: 'cover', title: 'Covern', time: '18:30:00-20:15:00', startTime: '18:30:00', endTime: '20:15:00' },
  { id: 'break1', title: 'Spielpause', time: '20:15:00-20:30:00', startTime: '20:15:00', endTime: '20:30:00' },
  { id: 'jam', title: 'Freies Jammen', time: '20:30:00-22:15:00', startTime: '20:30:00', endTime: '22:15:00' },
  { id: 'break2', title: 'Spielpause', time: '22:15:00-22:30:00', startTime: '22:15:00', endTime: '22:30:00' },
  { id: 'stage', title: 'Open Stage', time: '22:30:00-', startTime: '22:30:00', endTime: '23:59:59' }
];

const TimelineView: React.FC = () => {
  const { sounds, addSchedule, playSound, pauseSound, currentlyPlaying, toggleFavorite } = useSounds();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [mutedSchedules, setMutedSchedules] = useState<Set<string>>(new Set());
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const currentTime = now.toTimeString().split(' ')[0];

  const isTimeInSegment = (time: string, start: string, end: string) => time >= start && time <= end;
  const isPastSegment = (end: string) => currentTime > end;

  const toggleMute = (id: string) => {
    setMutedSchedules(prev => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const schedulesBySegment = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    SCHEDULE_SEGMENTS.forEach(segment => {
      grouped[segment.id] = [];
      sounds.forEach(sound => {
        sound.schedules.forEach(schedule => {
          if (isTimeInSegment(schedule.time, segment.startTime, segment.endTime)) {
            grouped[segment.id].push({
              ...schedule,
              soundName: sound.name,
              soundId: sound.id,
              soundUrl: sound.url,
              duration: sound.duration,
              isFavorite: sound.isFavorite,
              hasPlayed: isPastSegment(schedule.time)
            });
          }
        });
      });
      grouped[segment.id].sort((a, b) => a.time.localeCompare(b.time));
    });
    return grouped;
  }, [sounds, currentTime]);

  const handlePlaySound = (soundId: string, scheduleId: string) => {
    if (currentlyPlaying === soundId && activeSchedule === scheduleId) {
      pauseSound();
      setActiveSchedule(null);
    } else {
      if (currentlyPlaying) pauseSound();
      playSound(soundId);
      setActiveSchedule(scheduleId);
    }
  };

  const validateTime = (time: string) => time >= '00:00' && time <= '23:59';

  const handleAddSound = async () => {
    if (!selectedTime || !selectedSound) return;
    const fullTime = `${selectedTime}:00`;
    if (!validateTime(selectedTime)) return setError('Zeit ungültig');
    await addSchedule(selectedSound, fullTime);
    setSelectedSound(null);
    setSelectedTime('');
    setShowSoundPicker(false);
  };

  const handleGlobalAdd = () => {
    setSelectedSound(null);
    setSelectedTime(currentTime.slice(0, 5));
    setShowSoundPicker(true);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Global Add Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleGlobalAdd}
          className="p-2 rounded-lg bg-[#4ECBD9]/10 text-[#4ECBD9] hover:bg-[#4ECBD9]/20 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {SCHEDULE_SEGMENTS.map(segment => {
        const items = schedulesBySegment[segment.id] || [];
        const isActive = isTimeInSegment(currentTime, segment.startTime, segment.endTime);
        
        return (
          <div
            key={segment.id}
            className={`bg-neutral-800/50 rounded-lg overflow-hidden hover:bg-neutral-800/70 transition-all`}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="font-medium text-[#4ECBD9]">{segment.title}</h3>
                  <div className="flex items-center text-xs text-[#909296] mt-0.5">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{segment.startTime.slice(0,5)}–{segment.endTime.slice(0,5)}</span>
                  </div>
                </div>
                {isActive && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-[#4ECBD9]/10 text-[#4ECBD9]">
                    Aktuell
                  </span>
                )}
              </div>
            </div>

            {items.length > 0 && (
              <div className="border-t border-neutral-700/50 p-4">
                <div className="space-y-2">
                  {items.map(schedule => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-neutral-700/30"
                    >
                      <div className="flex items-center min-w-0">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-black/30 flex items-center justify-center mr-3">
                          <img
                            src={`${API_BASE}/cover.php?file=${encodeURIComponent((schedule.soundUrl || '').split('/').pop() || '')}`}
                            alt="cover"
                            className="w-full h-full object-cover hidden"
                            onLoad={(e) => {
                              e.currentTarget.classList.remove('hidden');
                              const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                              if (sib) sib.style.display = 'none';
                            }}
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                          <div className="text-[10px] text-[#909296]">♪</div>
                        </div>
                        <button
                          onClick={() => handlePlaySound(schedule.soundId, schedule.id)}
                          className={`p-2 rounded-full mr-3 ${
                            currentlyPlaying === schedule.soundId && activeSchedule === schedule.id
                              ? 'bg-[#4ECBD9]/20 text-[#4ECBD9]'
                              : 'bg-[#4ECBD9]/10 text-[#4ECBD9] hover:bg-[#4ECBD9]/20'
                          }`}
                        >
                          {currentlyPlaying === schedule.soundId && activeSchedule === schedule.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-[#C1C2C5] truncate">
                              {schedule.soundName}
                            </p>
                            {schedule.isFavorite && (
                              <Star className="h-3 w-3 ml-1 fill-[#F471B5] text-[#F471B5]" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-[#F471B5]">{formatTime(schedule.time)}</span>
                            <span className="text-[#909296]">•</span>
                            <span className="text-[#909296]">{formatDuration(schedule.duration)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleMute(schedule.id)}
                          className={`p-1.5 rounded-full transition-colors ${
                            mutedSchedules.has(schedule.id)
                              ? 'bg-[#4ECBD9]/10 text-[#4ECBD9]'
                              : 'bg-neutral-700 text-[#909296] hover:text-[#C1C2C5]'
                          }`}
                        >
                          {mutedSchedules.has(schedule.id) ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume1 className="h-4 w-4" />
                          )}
                        </button>
                        
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          schedule.active
                            ? 'bg-[#4ECBD9]/10 text-[#4ECBD9]'
                            : 'bg-neutral-700 text-[#909296]'
                        }`}>
                          {schedule.active ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {showSoundPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-800 rounded-xl border border-neutral-700 w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-neutral-700 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-[#C1C2C5]">
                  Sound zur Veranstaltung hinzufügen
                </h3>
                <p className="text-sm text-[#909296] mt-1">
                  Wählen Sie eine Zeit zwischen 00:00 und 23:59
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSoundPicker(false);
                  setSelectedSound(null);
                  setSelectedTime('');
                  setError(null);
                }}
                className="p-2 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-4">
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => {
                      setSelectedTime(e.target.value);
                      setError(null);
                    }}
                    className="bg-neutral-700/50 border border-neutral-600 rounded-lg px-3 py-2 text-sm text-[#C1C2C5]"
                    step="1"
                  />
                  <span className="text-sm text-[#909296]">
                    Wählen Sie die genaue Zeit
                  </span>
                </div>
                {error && (
                  <p className="text-sm text-[#F471B5]">{error}</p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1">
                {sounds.map(sound => (
                  <button
                    key={sound.id}
                    onClick={() => setSelectedSound(sound.id)}
                    className={`flex items-center p-3 rounded-lg ${
                      selectedSound === sound.id
                        ? 'bg-[#4ECBD9]/10 border border-[#4ECBD9]/30'
                        : 'bg-neutral-700/50 hover:bg-neutral-700 border border-transparent'
                    } transition-all relative group`}
                  >
                    <div className="flex-none w-12 h-12 rounded-md overflow-hidden bg-black/30">
                      <img
                        src={`${API_BASE}/cover.php?file=${encodeURIComponent((sound.url || '').split('/').pop() || '')}`}
                        alt="cover"
                        className="block w-full h-full object-cover hidden"
                        onLoad={(e) => { e.currentTarget.classList.remove('hidden'); }}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                    <div className="ml-3 text-left min-w-0">
                      <span className="block text-sm text-[#C1C2C5] truncate">{sound.name}</span>
                      <span className="text-xs text-[#909296]">{formatDuration(sound.duration)}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(sound.id);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Star className={`h-4 w-4 ${
                        sound.isFavorite 
                          ? 'fill-[#F471B5] text-[#F471B5]'
                          : 'text-[#909296] hover:text-[#C1C2C5]'
                      }`} />
                    </button>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-neutral-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSoundPicker(false);
                  setSelectedSound(null);
                  setSelectedTime('');
                  setError(null);
                }}
                className="px-4 py-2 text-sm text-[#909296] hover:text-[#C1C2C5]"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAddSound}
                disabled={!selectedTime || !selectedSound}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedTime && selectedSound
                    ? 'bg-[#4ECBD9]/10 text-[#4ECBD9] hover:bg-[#4ECBD9]/20'
                    : 'bg-neutral-700 text-[#909296] cursor-not-allowed'
                }`}
              >
                Sound hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineView;