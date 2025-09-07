import React, { useState, useCallback } from 'react';
import { Upload, FileAudio } from 'lucide-react';
import { useSounds } from '../context/SoundContext';

const SoundUploader: React.FC = () => {
  const { addSound } = useSounds();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/mpeg'];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (allowedTypes.includes(file.type) || file.name.endsWith('.mp3') || file.name.endsWith('.wav') || 
            file.name.endsWith('.ogg') || file.name.endsWith('.m4a')) {
          await addSound(file);
        }
      }
    } catch (error) {
      console.error('Error adding sound:', error);
    } finally {
      setIsUploading(false);
    }
  }, [addSound]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  return (
    <div
      className={`border-[0.5px] border-dashed rounded-xl p-6 text-center transition-colors ${
        isDragging
          ? 'border-[#4ECBD9] bg-[#4ECBD9]/5'
          : 'border-[#4ECBD9]/20 hover:border-[#4ECBD9] hover:bg-neutral-800/30'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mx-auto flex justify-center mb-4">
        {isUploading ? (
          <div className="animate-spin rounded-full h-10 w-10 border-b-[0.5px] border-[#4ECBD9]" />
        ) : (
          <div className="bg-[#4ECBD9]/10 p-3 rounded-full">
            <Upload className="h-8 w-8 text-[#4ECBD9]" />
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-medium text-[#C1C2C5] mb-1">
        {isUploading ? 'Verarbeite Audio...' : 'Audiodateien hochladen'}
      </h3>
      
      <p className="text-sm text-[#909296] mb-4">
        Drag & Drop oder klicken zum Auswählen
      </p>
      
      <div className="flex justify-center items-center space-x-3 mb-4">
        <FileAudio className="h-5 w-5 text-[#909296]" />
        <span className="text-xs text-[#909296]">
          Unterstützte Formate: MP3, WAV, OGG, M4A
        </span>
      </div>
      
      <input
        type="file"
        className="hidden"
        id="file-upload"
        multiple
        accept=".mp3,.wav,.ogg,.m4a,audio/*"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      
      <label
        htmlFor="file-upload"
        className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl text-[#C1C2C5] bg-neutral-800/50 border-[0.5px] border-[#4ECBD9]/10 hover:bg-neutral-800 hover:border-[#4ECBD9]/30 transition-all cursor-pointer"
      >
        <FileAudio className="h-5 w-5 mr-2 text-[#4ECBD9]" />
        Dateien auswählen
      </label>
    </div>
  );
};

export default SoundUploader;