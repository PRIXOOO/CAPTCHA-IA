import React, { useState, useEffect } from 'react';
import { SessionData, Step } from './types';
import PuzzleGame from './components/games/PuzzleGame';
import ImageSelectGame from './components/games/ImageSelectGame';
import TraceGame from './components/games/TraceGame';
import Results from './components/Results';
import { saveSessionToHistory } from './utils/storage';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.INTRO);
  const [currentSessions, setCurrentSessions] = useState<SessionData[]>([]);
  const [scale, setScale] = useState(1);
  const { t, language, setLanguage } = useLanguage();

  const BASE_WIDTH = 500;
  const BASE_HEIGHT = 750;

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const scaleX = (w / BASE_WIDTH) * 0.95;
      const scaleY = (h / BASE_HEIGHT) * 0.95;
      const newScale = Math.min(Math.min(scaleX, scaleY), 1.1);
      setScale(newScale);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGameComplete = (data: SessionData) => {
    saveSessionToHistory(data);
    const newSessions = [...currentSessions, data];
    setCurrentSessions(newSessions);

    if (step === Step.PUZZLE) setStep(Step.IMAGE_SELECT);
    else if (step === Step.IMAGE_SELECT) setStep(Step.TRACE);
    else if (step === Step.TRACE) setStep(Step.ANALYSIS);
  };

  const startSequence = () => {
    setCurrentSessions([]);
    setStep(Step.PUZZLE);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <div className="h-screen w-screen bg-background text-text flex flex-col overflow-hidden items-center justify-center">
      <div 
        style={{ 
          transform: `scale(${scale})`,
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
        }}
        className="flex flex-col origin-center transition-transform duration-100 ease-out shrink-0"
      >
        <header className="w-full py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="font-mono font-bold tracking-widest text-xs text-gray-500 uppercase">{t.app.title}</span>
          </div>
          <div className="flex gap-1.5">
            {[Step.PUZZLE, Step.IMAGE_SELECT, Step.TRACE].map((s) => (
               <div 
                 key={s} 
                 className={`w-1.5 h-1.5 rounded-full transition-colors ${
                   Object.values(Step).indexOf(step) > Object.values(Step).indexOf(s) 
                     ? 'bg-secondary' 
                     : Object.values(Step).indexOf(step) === Object.values(Step).indexOf(s) 
                       ? 'bg-primary' 
                       : 'bg-gray-800'
                 }`}
               />
            ))}
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center w-full">
          {step === Step.INTRO && (
            <div className="text-center space-y-6 animate-fade-in">
              <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                {t.app.verify_title}
              </h1>
              <p className="text-gray-400 text-lg">
                {t.app.verify_desc}
              </p>
              <div className="pt-4">
                <button 
                  onClick={startSequence}
                  className="px-10 py-4 bg-surface border border-primary text-primary hover:bg-primary hover:text-black font-bold text-lg rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(87,166,255,0.1)] active:scale-95"
                >
                  {t.app.init_btn}
                </button>
              </div>
            </div>
          )}

          <div className="w-full flex justify-center">
            {step === Step.PUZZLE && <PuzzleGame onComplete={handleGameComplete} />}
            {step === Step.IMAGE_SELECT && <ImageSelectGame onComplete={handleGameComplete} />}
            {step === Step.TRACE && <TraceGame onComplete={handleGameComplete} />}
            {step === Step.ANALYSIS && <Results data={currentSessions} onReset={startSequence} />}
          </div>
        </main>

        <footer className="w-full py-4 flex flex-col items-center gap-2 shrink-0">
          <div className="text-[10px] text-gray-700 font-mono">
             {t.app.secure_connection} // {currentSessions.length}/3 {t.app.captured}
          </div>
          <button 
            onClick={toggleLanguage} 
            className="text-[10px] text-primary/60 hover:text-primary underline cursor-pointer hover:scale-105 transition-all"
          >
             {t.app.switch_lang}
          </button>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;