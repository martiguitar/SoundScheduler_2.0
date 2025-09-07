import React, { useState } from 'react';
import { Plus, Trash, Save, X, Clock } from 'lucide-react';
import { Schedule } from '../types';
import { useSounds } from '../context/SoundContext';
import { formatTime } from '../utils/helpers';

interface ScheduleEditorProps {
  soundId: string;
  schedules: Schedule[];
  onClose: () => void;
}

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ 
  soundId, 
  schedules,
  onClose 
}) => {
  const { addSchedule, updateSchedule, deleteSchedule } = useSounds();
  const [newTime, setNewTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    if (newTime && !isSubmitting) {
      try {
        setIsSubmitting(true);
        await addSchedule(soundId, newTime + ':00'); // Add seconds
        setNewTime('');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleUpdateSchedule = async (scheduleId: string, time: string, active: boolean) => {
    if (!isSubmitting) {
      try {
        setIsSubmitting(true);
        await updateSchedule(soundId, scheduleId, time + ':00', active); // Add seconds
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="border border-gray-800 rounded-xl p-4 bg-gray-900/50 mb-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-200 flex items-center">
          <Clock className="h-4 w-4 mr-1 text-cyan-400" />
          Schedule Manager
        </h3>
        <button 
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-400 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="mb-4">
        <form onSubmit={handleAddSchedule} className="flex items-center space-x-2">
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm flex-1 text-gray-200"
            step="1"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!newTime || isSubmitting}
            className={`p-2 rounded-full ${
              newTime && !isSubmitting
                ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20' 
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            } transition-colors`}
          >
            <Plus className="h-5 w-5" />
          </button>
        </form>
      </div>
      
      {schedules.length > 0 ? (
        <ul className="space-y-2">
          {schedules.map(schedule => (
            <li 
              key={schedule.id}
              className="flex items-center justify-between border border-gray-800 rounded-lg p-3 bg-gray-800/50"
            >
              <div className="flex items-center">
                <input
                  type="time"
                  value={schedule.time.slice(0, -3)} // Remove seconds for input
                  onChange={(e) => handleUpdateSchedule(
                    schedule.id, 
                    e.target.value, 
                    schedule.active
                  )}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm w-28 text-gray-200"
                  step="1"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-gray-400">
                  ({formatTime(schedule.time)})
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={schedule.active}
                    onChange={(e) => handleUpdateSchedule(
                      schedule.id,
                      schedule.time.slice(0, -3), // Remove seconds when toggling
                      e.target.checked
                    )}
                    className="sr-only peer"
                    disabled={isSubmitting}
                  />
                  <div className="relative w-9 h-5 bg-gray-700 peer-focus:ring-2 peer-focus:ring-cyan-400/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
                
                <button
                  onClick={() => deleteSchedule(soundId, schedule.id)}
                  className="p-1 text-gray-500 hover:text-pink-400 transition-colors"
                  disabled={isSubmitting}
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-4 bg-gray-800/30 rounded-lg">
          <p className="text-sm text-gray-400">
            No schedules yet. Add your first one above.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScheduleEditor;