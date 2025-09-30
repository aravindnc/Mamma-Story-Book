import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { PhotoUploader } from './components/PhotoUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generatePhotoBookPage, generateCaptionOnly } from './services/geminiService';
import { calculateJourneyContext, formatDateForDisplay } from './utils/dateUtils';

function App() {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoDate, setPhotoDate] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedCaption, setGeneratedCaption] = useState<string | null>(null);
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
    if (generatedImage) {
        setGeneratedImage(null);
        setGeneratedCaption(null);
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
    setGeneratedImage(null);
    setGeneratedCaption(null);

    try {
      const base64Image = await getBase64(photoFile);
      const mimeType = photoFile.type;
      const dateContext = calculateJourneyContext(photoDate);
      const formattedDate = formatDateForDisplay(photoDate);


      const { imageUrl, caption } = await generatePhotoBookPage(
        base64Image,
        mimeType,
        prompt,
        dateContext,
        formattedDate
      );
      
      setGeneratedImage(imageUrl);
      setGeneratedCaption(caption);

    } catch (err: any) {
      console.error(err);
      if (err?.message?.toLowerCase().includes('quota')) {
        setError('Our magical storybook machine is resting! We\'ve reached the daily limit. Please try again tomorrow.');
      } else {
        setError('An error occurred while generating the page. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [photoFile, photoDate, prompt]);

  const handleRegenerateCaption = useCallback(async () => {
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
      
      setGeneratedCaption(newCaption);

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
    <div className="min-h-screen bg-pink-50 text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left Side: Inputs */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-pink-100 flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-pink-800">Create Your Page</h2>
            
            <PhotoUploader onPhotoChange={handlePhotoChange} preview={photoPreview} />
            
            <div>
              <label htmlFor="photoDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Photo
              </label>
              <input
                type="date"
                id="photoDate"
                value={photoDate}
                onChange={(e) => setPhotoDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 transition bg-white text-gray-900"
                required
              />
            </div>

            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Add a memory or note (optional)
              </label>
              <textarea
                id="prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'I remember how happy you were on this day...'"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 transition bg-white text-gray-900"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || isRegeneratingCaption || !photoFile || !photoDate}
              className="w-full bg-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Generating...
                </>
              ) : (
                'Generate Storybook Page'
              )}
            </button>
            {error && <p className="text-red-500 text-center">{error}</p>}
          </div>

          {/* Right Side: Output */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-pink-100 flex items-center justify-center min-h-[400px] lg:min-h-0">
            {isLoading && (
              <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-pink-700 animate-pulse">Crafting your memory... this can take a moment.</p>
              </div>
            )}
            {!isLoading && generatedImage && generatedCaption && (
              <ResultDisplay
                imageUrl={generatedImage}
                caption={generatedCaption}
                photoDate={photoDate}
                onRegenerateCaption={handleRegenerateCaption}
                isRegeneratingCaption={isRegeneratingCaption}
              />
            )}
            {!isLoading && !generatedImage && (
              <div className="text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-pink-300 mb-4"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                <h3 className="text-lg font-semibold">Your generated page will appear here</h3>
                <p className="text-sm">Fill in the details on the left and click 'Generate' to start.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
