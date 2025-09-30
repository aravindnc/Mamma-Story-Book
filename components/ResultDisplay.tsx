import React, { useState, useCallback } from 'react';

interface ResultDisplayProps {
  imageUrl: string;
  caption: string;
  photoDate: string;
  onRegenerateCaption: () => void;
  isRegeneratingCaption: boolean;
}

const DownloadIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const CopyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

const RefreshCwIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M3 21v-5h5"/>
  </svg>
);


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageUrl, caption, photoDate, onRegenerateCaption, isRegeneratingCaption }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const getFileExtensionFromMimeType = (dataUrl: string): string => {
    const mimeTypeMatch = dataUrl.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    if (mimeTypeMatch && mimeTypeMatch[1]) {
      const mimeType = mimeTypeMatch[1];
      return mimeType.split('/')[1] || 'png';
    }
    return 'png';
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    const fileExtension = getFileExtensionFromMimeType(imageUrl);
    link.download = `${photoDate || 'storybook-page'}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(caption).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [caption]);

  return (
    <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
      <div className="w-full aspect-[210/297] bg-white p-2 rounded-lg shadow-2xl overflow-hidden">
        <img src={imageUrl} alt="Generated photo book page" className="w-full h-full object-cover" />
      </div>

      <div className="w-full bg-pink-100/50 p-4 rounded-lg border border-pink-200/60">
        <p className="text-gray-700 font-lora italic text-center">"{caption}"</p>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-3 items-center justify-center gap-4 mt-2">
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 bg-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-700 transition-transform transform hover:scale-105"
        >
          <DownloadIcon />
          Download
        </button>
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-transform transform hover:scale-105"
        >
          <CopyIcon />
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={onRegenerateCaption}
          disabled={isRegeneratingCaption}
          className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isRegeneratingCaption ? (
            <RefreshCwIcon className="animate-spin" />
          ) : (
            <RefreshCwIcon />
          )}
          New Caption
        </button>
      </div>
    </div>
  );
};