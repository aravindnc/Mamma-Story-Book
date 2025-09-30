import React, { useRef, useCallback } from 'react';
import { parseDateFromFileName } from '../utils/dateUtils';

interface PhotoUploaderProps {
  onPhotoChange: (file: File, preview: string, parsedDate: string | null) => void;
  preview: string | null;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 text-gray-400">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onPhotoChange, preview }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const parsedDate = parseDateFromFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoChange(file, reader.result as string, parsedDate);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Photo
      </label>
      {preview ? (
        <div className="mt-1 text-center">
          <img src={preview} alt="Preview" className="max-h-60 rounded-lg object-contain mx-auto border p-1 bg-gray-50" />
           <button
            type="button"
            onClick={handleClick}
            className="mt-4 text-sm font-medium text-pink-600 hover:text-pink-500 bg-white rounded-md focus-within:outline-none"
           >
            Replace Photo
           </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-pink-400 transition"
        >
          <div className="space-y-1 text-center">
            <UploadIcon />
            <div className="flex text-sm text-gray-600">
              <span className="relative bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none">
                <span>Upload a file</span>
              </span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        id="file-upload"
        name="file-upload"
        type="file"
        className="sr-only"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};