import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  score: number; // 0 to 1 (Raw Bot Probability)
  isHuman: boolean;
  onRestart: () => void;
  onNext: () => void;
}

const Verdict: React.FC<Props> = ({ score, isHuman, onRestart, onNext }) => {
  const { t } = useLanguage();
  const [displayScore, setDisplayScore] = useState(0);
  const [showContent, setShowContent] = useState(false);

  // LOGIC VISUALIZATION:
  // If Human (low score), we want to show High "Humanity" %. (1 - score)
  // If Bot (high score), we want to show High "Bot" %. (score)
  // This ensures the user always sees a high "Confidence" number.
  const confidencePercent = isHuman ? (1 - score) : score;

  useEffect(() => {
    // Animation du score
    const targetScore = Math.max(0, Math.min(100, Math.round(confidencePercent * 100)));
    let current = 0;
    
    // Quick ramp up
    const interval = setInterval(() => {
      current += 1;
      if (current >= targetScore) {
        current = targetScore;
        clearInterval(interval);
        setTimeout(() => setShowContent(true), 500);
      }
      setDisplayScore(current);
    }, 15); // Slightly faster counter

    return () => clearInterval(interval);
  }, [confidencePercent]);

  const colorClass = isHuman ? 'text-secondary' : 'text-danger';
  const bgGlow = isHuman ? 'shadow-[0_0_100px_rgba(78,204,163,0.2)]' : 'shadow-[0_0_100px_rgba(231,76,60,0.2)]';
  const borderClass = isHuman ? 'border-secondary' : 'border-danger';

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[600px] animate-fade-in relative overflow-hidden rounded-xl bg-black border border-gray-800">
      
      {/* Background Grids */}
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_90%)] z-10 pointer-events-none`}></div>
      <div className={`absolute inset-0 opacity-10 bg-[size:40px_40px] bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] z-0`}></div>

      <div className="z-20 flex flex-col items-center">
        
        {/* Main Circle Gauge */}
        <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
          {/* Rotating Rings */}
          <div className={`absolute inset-0 border-4 ${borderClass} opacity-20 rounded-full animate-[spin_10s_linear_infinite]`}></div>
          <div className={`absolute inset-4 border-2 ${borderClass} opacity-40 rounded-full animate-[spin_15s_linear_infinite_reverse] border-dashed`}></div>
          
          {/* Central Score */}
          <div className={`relative z-10 flex flex-col items-center justify-center w-48 h-48 bg-gray-900 rounded-full border-4 ${borderClass} ${bgGlow}`}>
             <span className={`text-6xl font-black font-mono ${colorClass}`}>
                {displayScore}%
             </span>
             <span className="text-gray-500 text-xs tracking-widest uppercase mt-2">
                 {isHuman ? t.verdict.humanity : t.verdict.artificiality}
             </span>
          </div>
        </div>

        {/* Verdict Text */}
        <div className={`text-center space-y-4 transition-all duration-1000 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
           <h1 className={`text-5xl md:text-6xl font-black uppercase tracking-tighter ${colorClass} drop-shadow-lg`}>
             {isHuman ? t.verdict.human_detected : t.verdict.bot_detected}
           </h1>
           <div className="h-1 w-32 bg-gray-800 mx-auto rounded-full overflow-hidden">
             <div className={`h-full ${isHuman ? 'bg-secondary' : 'bg-danger'} w-full animate-pulse`}></div>
           </div>
           <p className="text-gray-400 font-mono text-sm max-w-md mx-auto leading-relaxed">
             {isHuman ? t.verdict.human_desc : t.verdict.bot_desc}
           </p>
        </div>

        {/* Action Buttons */}
        <div className={`mt-12 flex gap-4 transition-all duration-1000 delay-500 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <button
            onClick={onRestart}
            className={`px-8 py-4 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-3`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {t.verdict.restart_btn}
          </button>
          
          <button
            onClick={onNext}
            className={`px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(87,166,255,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 animate-pulse`}
          >
            {t.verdict.next_btn}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        </div>

      </div>

      {/* Decorative Corners */}
      <div className={`absolute top-4 left-4 w-24 h-24 border-t-2 border-l-2 ${borderClass} opacity-50`}></div>
      <div className={`absolute bottom-4 right-4 w-24 h-24 border-b-2 border-r-2 ${borderClass} opacity-50`}></div>
    </div>
  );
};

export default Verdict;