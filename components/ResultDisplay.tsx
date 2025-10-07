import React, { useState, useCallback } from 'react';

interface GeneratedPage {
  imageUrl: string;
  caption: string;
}

interface ResultDisplayProps {
  pages: GeneratedPage[];
  photoDate: string;
  onRegenerateCaption: (index: number) => void;
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


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ pages, photoDate, onRegenerateCaption, isRegeneratingCaption }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  
  if (!pages || pages.length === 0) {
    return <p>Something went wrong. No pages were generated.</p>;
  }
  
  const selectedPage = pages[selectedIndex];

  const getFileExtensionFromMimeType = (dataUrl: string): string => {
    const mimeTypeMatch = dataUrl.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    if (mimeTypeMatch && mimeTypeMatch[1]) {
      const mimeType = mimeTypeMatch[1];
      return mimeType.split('/')[1] || 'png';
    }
    return 'png';
  }

  const handleDownload = () => {
    if (!selectedPage) return;
    const link = document.createElement('a');
    link.href = selectedPage.imageUrl;
    const fileExtension = getFileExtensionFromMimeType(selectedPage.imageUrl);
    link.download = `${photoDate || 'storybook-page'}-${selectedIndex + 1}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = useCallback(() => {
    if (!selectedPage) return;
    navigator.clipboard.writeText(selectedPage.caption).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [selectedPage]);
  
  const handleRegenerate = useCallback(() => {
    onRegenerateCaption(selectedIndex);
  }, [onRegenerateCaption, selectedIndex]);

  return (
    <div className="w-100 d-flex flex-column align-items-center gap-4 animate-fade-in">
      <div className="w-100 bg-white p-2 rounded-3 shadow-lg overflow-hidden aspect-a4">
        <img src={selectedPage.imageUrl} alt={`Generated photo book page - style ${selectedIndex + 1}`} className="w-100 h-100" style={{objectFit: 'cover'}} />
      </div>

      <div className="w-100 bg-primary-subtle p-4 rounded-3 border border-primary-border-subtle">
        <p className="text-dark font-lora fst-italic text-center mb-0">"{selectedPage.caption}"</p>
      </div>

      <div className="w-100 row g-2">
        <div className="col-12 col-sm">
          <button
            onClick={handleDownload}
            className="w-100 btn btn-lg btn-primary d-flex align-items-center justify-content-center gap-2"
          >
            <DownloadIcon />
            Download
          </button>
        </div>
        <div className="col-12 col-sm">
          <button
            onClick={handleCopy}
            className="w-100 btn btn-lg btn-secondary d-flex align-items-center justify-content-center gap-2"
          >
            <CopyIcon />
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="col-12 col-sm">
          <button
            onClick={handleRegenerate}
            disabled={isRegeneratingCaption}
            className="w-100 btn btn-lg btn-info d-flex align-items-center justify-content-center gap-2"
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
      
      <div className="w-100 pt-4 mt-2 border-top">
        <h4 className="text-center small fw-semibold text-muted mb-3">Choose a style</h4>
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-3">
            {pages.map((page, index) => (
                <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`thumbnail-button ${selectedIndex === index ? 'active' : ''}`}
                    aria-label={`Select style ${index + 1}`}
                >
                    <img src={page.imageUrl} alt={`Thumbnail for style ${index + 1}`} />
                </button>
            ))}
        </div>
      </div>

    </div>
  );
};
