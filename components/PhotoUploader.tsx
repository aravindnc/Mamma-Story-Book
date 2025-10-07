import React, { useRef, useCallback } from 'react';
import { parseDateFromFileName } from '../utils/dateUtils';

interface PhotoUploaderProps {
  onPhotoChange: (file: File, preview: string, parsedDate: string | null) => void;
  preview: string | null;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted">
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
      <label className="form-label fw-medium">
        Upload Photo
      </label>
      {preview ? (
        <div className="mt-1 text-center">
          <img src={preview} alt="Preview" className="img-fluid rounded-3 mx-auto border p-1 bg-light" style={{maxHeight: '15rem', objectFit: 'contain'}} />
           <button
            type="button"
            onClick={handleClick}
            className="btn btn-link mt-2 text-decoration-none"
           >
            Replace Photo
           </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="mt-1 d-flex justify-content-center p-5 border-2 border-dashed rounded-3 cursor-pointer"
        >
          <div className="text-center">
            <UploadIcon />
            <div className="d-flex justify-content-center small text-muted mt-2">
              <span className="fw-medium text-primary" style={{cursor: 'pointer'}}>
                <span>Upload a file</span>
              </span>
              <p className="ms-1 mb-0">or drag and drop</p>
            </div>
            <p className="mb-0 mt-1" style={{fontSize: '0.75rem'}}><small className="text-muted">PNG, JPG, GIF up to 10MB</small></p>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        id="file-upload"
        name="file-upload"
        type="file"
        className="d-none"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};
