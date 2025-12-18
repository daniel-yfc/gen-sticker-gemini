import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import StyleSelector from './components/StyleSelector';
import FileUpload from './components/FileUpload';
import ProcessingView from './components/ProcessingView';
import ResultDisplay from './components/ResultDisplay';
import Gallery from './components/Gallery';
import StickerHistory from './components/StickerHistory';
import ImageEditor from './components/ImageEditor';
import { STYLES, TRANSLATIONS } from './constants';
import { AppStatus, StyleOption, Language, ViewMode, StickerRecord } from './types';
import { generateSticker } from './services/geminiService';
import { AlertCircle, ArrowRight } from 'lucide-react';

const HISTORY_KEY = 'sticker_maker_history_v2';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>(STYLES[0]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Image State
  const [rawImage, setRawImage] = useState<string | null>(null); // Original upload
  const [processedImage, setProcessedImage] = useState<string | null>(null); // After edit/crop

  // Navigation & Localization State
  const [view, setView] = useState<ViewMode>('create');
  const [language, setLanguage] = useState<Language>('zh-TW');
  
  // History State
  const [history, setHistory] = useState<StickerRecord[]>([]);

  // Translation Helper
  const t = (key: string) => {
    return (TRANSLATIONS[language] as any)[key] || key;
  };

  // Load History on Mount
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save History when updated
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = (imageUrl: string, styleId: number) => {
    const newRecord: StickerRecord = {
      id: Date.now().toString(),
      imageUrl,
      styleId,
      timestamp: Date.now()
    };
    setHistory(prev => [newRecord, ...prev]);
  };

  const deleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleStyleSelect = useCallback((style: StyleOption) => {
    setSelectedStyle(style);
  }, []);

  const handleGallerySelect = (styleId: number) => {
    const style = STYLES.find(s => s.id === styleId);
    if (style) {
      setSelectedStyle(style);
      setView('create');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 1. User Uploads File -> Goes to Edit Mode
  const handleFileSelect = async (file: File) => {
    setStatus(AppStatus.UPLOADING);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawImage(reader.result);
        setStatus(AppStatus.EDITING); // Trigger Editor
      }
    };
    reader.onerror = () => {
      setErrorMessage(t('error_upload'));
      setStatus(AppStatus.ERROR);
    };
    reader.readAsDataURL(file);
  };

  // 2. User Confirms Edit -> Ready to Generate
  const handleEditConfirm = (newImageBase64: string) => {
    setProcessedImage(newImageBase64);
    setStatus(AppStatus.READY);
  };

  // 3. Generate Action
  const handleGenerate = async () => {
    if (!processedImage) return;
    
    setStatus(AppStatus.PROCESSING);
    setErrorMessage(null);
    setGeneratedImage(null);

    try {
      const resultImage = await generateSticker(processedImage, selectedStyle);
      
      const img = new Image();
      img.onload = () => {
          setGeneratedImage(resultImage);
          addToHistory(resultImage, selectedStyle.id);
          setStatus(AppStatus.SUCCESS);
      };
      img.onerror = () => {
          throw new Error("Generated image validation failed.");
      };
      img.src = resultImage;

    } catch (error) {
      console.error(error);
      setErrorMessage(t('error_process'));
      setStatus(AppStatus.ERROR);
    }
  };

  // Reset to initial state
  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setGeneratedImage(null);
    setErrorMessage(null);
    setRawImage(null);
    setProcessedImage(null);
  };

  // Reuse same image, reset result but keep image ready
  const handleReuse = () => {
    setStatus(AppStatus.READY);
    setGeneratedImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Update result image (e.g. from magic wand)
  const handleImageUpdate = (newUrl: string) => {
    setGeneratedImage(newUrl);
    // Update the history record if it was just added? 
    // For simplicity, we just add the updated one as new or let user download.
    // Actually, improving UX: update the top history item if it matches current session.
    // For now, simple state update is enough for download.
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header 
        currentView={view} 
        onViewChange={setView}
        currentLang={language}
        onLangChange={setLanguage}
        t={t}
      />

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8">
        
        {view === 'gallery' ? (
          <Gallery 
            onSelectStyle={handleGallerySelect} 
            t={t}
            stylesTranslation={(TRANSLATIONS[language] as any).styles}
          />
        ) : view === 'history' ? (
          <StickerHistory 
            history={history} 
            onDelete={deleteFromHistory} 
            t={t}
            stylesTranslation={(TRANSLATIONS[language] as any).styles}
          />
        ) : (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Image Editor Modal/Overlay */}
            {status === AppStatus.EDITING && rawImage && (
               <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                 <div className="w-full max-w-xl">
                   <ImageEditor 
                     imageSrc={rawImage}
                     onConfirm={handleEditConfirm}
                     onCancel={() => {
                        setRawImage(null);
                        setStatus(AppStatus.IDLE);
                     }}
                     t={t}
                   />
                 </div>
               </div>
            )}

            {/* Welcome Message */}
            {status === AppStatus.IDLE && (
               <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                 <h2 className="text-xl font-bold text-gray-800 mb-2">{t('welcome_title')}</h2>
                 <p className="text-gray-600">
                   {t('welcome_desc')} <span className="font-bold text-indigo-600">{t('welcome_default_style')}</span>。
                 </p>
               </div>
            )}

            {/* Main Layout */}
            {status === AppStatus.SUCCESS && generatedImage ? (
              <div className="space-y-12">
                <ResultDisplay 
                  imageUrl={generatedImage} 
                  style={selectedStyle} 
                  onReset={handleReset} 
                  onReuse={handleReuse}
                  onImageUpdate={handleImageUpdate}
                  t={t}
                  stylesTranslation={(TRANSLATIONS[language] as any).styles}
                />
                <div className="border-t border-gray-200 pt-8">
                  <StickerHistory 
                    history={history} 
                    onDelete={deleteFromHistory} 
                    t={t} 
                    stylesTranslation={(TRANSLATIONS[language] as any).styles}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Creation Flow */}
                {(status === AppStatus.IDLE || status === AppStatus.READY || status === AppStatus.UPLOADING || status === AppStatus.ERROR || status === AppStatus.SUCCESS) && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 order-2 lg:order-1">
                      <StyleSelector 
                        selectedStyle={selectedStyle} 
                        onSelect={handleStyleSelect} 
                        disabled={false}
                        t={t}
                        stylesTranslation={(TRANSLATIONS[language] as any).styles}
                      />
                    </div>
                    <div className="lg:col-span-1 order-1 lg:order-2 space-y-4">
                       <div className="sticky top-24 space-y-6">
                          <FileUpload 
                            onFileSelect={handleFileSelect} 
                            currentPreview={processedImage || undefined}
                            onEditClick={() => setStatus(AppStatus.EDITING)}
                            disabled={status === AppStatus.PROCESSING}
                            t={t}
                          />
                           
                          {/* Generate Button - Only visible when ready */}
                          {status === AppStatus.READY && (
                            <button
                              onClick={handleGenerate}
                              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 animate-pulse"
                            >
                              <Sparkles className="w-5 h-5" />
                              GO! (Start)
                              <ArrowRight className="w-5 h-5" />
                            </button>
                          )}

                          {status === AppStatus.ERROR && errorMessage && (
                              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <span className="text-sm font-medium">{errorMessage}</span>
                              </div>
                          )}
                       </div>
                    </div>
                  </div>
                )}

                {/* Processing View */}
                {status === AppStatus.PROCESSING && (
                  <div className="max-w-xl mx-auto mt-12">
                    <ProcessingView t={t} />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
      
      {/* Import sparkles icon locally for the button above */}
      <div className="hidden">
        <Sparkles />
      </div>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>{t('footer')}</p>
        </div>
      </footer>
    </div>
  );
};

// Simple internal icon component for the Generate button
const Sparkles = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);


export default App;