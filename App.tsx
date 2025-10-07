import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { PhotoUploader } from './components/PhotoUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generatePhotoBookPage, generateCaptionOnly } from './services/geminiService';
import { calculateJourneyContext, formatDateForDisplay } from './utils/dateUtils';

// Define the type for a generated page
interface GeneratedPage {
  imageUrl: string;
  caption: string;
}

function App() {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoDate, setPhotoDate] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [customHeading, setCustomHeading] = useState<string>('');

  const [generatedPages, setGeneratedPages] = useState<GeneratedPage[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegeneratingCaption, setIsRegeneratingCaption] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (file: File, preview: string, parsedDate: string | null) => {
    setPhotoFile(file);
    setPhotoPreview(preview);
    if (parsedDate) {
      setPhotoDate(parsedDate);
    }
    // Clear previous results when a new photo is uploaded
    if (generatedPages) {
        setGeneratedPages(null);
    }
  };
  
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = useCallback(async () => {
    if (!photoFile || !photoDate) {
      setError('Please upload a photo and select a date.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedPages(null);

    try {
      const base64Image = await getBase64(photoFile);
      const mimeType = photoFile.type;
      const dateContext = calculateJourneyContext(photoDate);
      const formattedDate = formatDateForDisplay(photoDate);


      const pages = await generatePhotoBookPage(
        base64Image,
        mimeType,
        prompt,
        dateContext,
        formattedDate,
        customHeading
      );
      
      setGeneratedPages(pages);

    } catch (err: any) {
      console.error(err);
      if (err?.message?.toLowerCase().includes('quota')) {
        setError('Our magical storybook machine is resting! We\'ve reached the daily limit. Please try again tomorrow.');
      } else {
        setError(err.message || 'An error occurred while generating the page. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [photoFile, photoDate, prompt, customHeading]);

  const handleRegenerateCaption = useCallback(async (pageIndex: number) => {
    if (!photoFile) return;

    setIsRegeneratingCaption(true);
    setError(null);

    try {
      const base64Image = await getBase64(photoFile);
      const mimeType = photoFile.type;
      const dateContext = calculateJourneyContext(photoDate);

      const newCaption = await generateCaptionOnly(
        base64Image,
        mimeType,
        prompt,
        dateContext
      );
      
      setGeneratedPages(currentPages => {
        if (!currentPages) return null;
        const updatedPages = [...currentPages];
        updatedPages[pageIndex] = { ...updatedPages[pageIndex], caption: newCaption };
        return updatedPages;
      });

    } catch (err: any) {
      console.error(err);
      if (err?.message?.toLowerCase().includes('quota')) {
        setError('Our magical storybook machine is resting! We\'ve reached the daily limit. Please try again tomorrow.');
      } else {
        setError('An error occurred while regenerating the caption. Please try again.');
      }
    } finally {
      setIsRegeneratingCaption(false);
    }
  }, [photoFile, photoDate, prompt]);

  return (
    <div className="min-vh-100 text-dark">
      <Header />
      <main className="container py-4 py-lg-5">
        <div className="row g-4 g-lg-5 justify-content-center">
          {/* Left Side: Inputs */}
          <div className="col-lg-6">
            <div className="card shadow-lg border-0 h-100">
              <div className="card-body p-4 p-md-5">
                <h2 className="h3 fw-bold text-primary mb-4">Create Your Page</h2>
                
                <div className="mb-4">
                  <PhotoUploader onPhotoChange={handlePhotoChange} preview={photoPreview} />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="photoDate" className="form-label fw-medium">
                    Date of Photo
                  </label>
                  <input
                    type="date"
                    id="photoDate"
                    value={photoDate}
                    onChange={(e) => setPhotoDate(e.target.value)}
                    className="form-control form-control-lg"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="customHeading" className="form-label fw-medium">
                    Custom Heading (optional)
                  </label>
                  <input
                    type="text"
                    id="customHeading"
                    value={customHeading}
                    onChange={(e) => setCustomHeading(e.target.value)}
                    placeholder="e.g., 'Our Little Miracle'"
                    className="form-control form-control-lg"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="prompt" className="form-label fw-medium">
                    Add a memory or note (optional)
                  </label>
                  <textarea
                    id="prompt"
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'I remember how happy you were on this day...'"
                    className="form-control form-control-lg"
                  />
                </div>

                <div className="d-grid">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || isRegeneratingCaption || !photoFile || !photoDate}
                    className="btn btn-primary btn-lg d-flex align-items-center justify-content-center"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner />
                        <span>Generating...</span>
                      </>
                    ) : (
                      'Generate Storybook Page'
                    )}
                  </button>
                </div>
                {error && <p className="text-danger text-center mt-3">{error}</p>}
              </div>
            </div>
          </div>


          {/* Right Side: Output */}
          <div className="col-lg-6">
            <div className="card shadow-lg border-0 h-100 d-flex align-items-center justify-content-center p-4 p-md-5" style={{minHeight: '400px'}}>
              {isLoading && (
                <div className="text-center">
                   <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                      <span className="visually-hidden">Loading...</span>
                   </div>
                  <p className="mt-4 text-primary">Crafting your memory... this can take a moment.</p>
                </div>
              )}
              {!isLoading && generatedPages && generatedPages.length > 0 && (
                <ResultDisplay
                  pages={generatedPages}
                  photoDate={photoDate}
                  onRegenerateCaption={handleRegenerateCaption}
                  isRegeneratingCaption={isRegeneratingCaption}
                />
              )}
              {!isLoading && !generatedPages && (
                <div className="text-center text-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-primary-bg-subtle mb-4"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                  <h3 className="h5 fw-semibold">Your generated pages will appear here</h3>
                  <p className="small">You'll get 5 design options to choose from!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
