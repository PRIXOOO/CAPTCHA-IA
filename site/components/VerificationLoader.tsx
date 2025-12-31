import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  status: string;
  subStatus: string;
}

// Helper pour l'effet de texte qui se décrypte (Matrix style)
const ScrambleText = ({ text, className }: { text: string; className?: string }) => {
  const [display, setDisplay] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 2; // Vitesse de décryptage
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span className={className}>{display}</span>;
};

const VerificationLoader: React.FC<Props> = ({ status, subStatus }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-[100] bg-[#030507] flex flex-col items-center justify-center overflow-hidden font-mono text-primary select-none cursor-wait perspective-container">
      
      {/* --- BACKGROUND LAYERS --- */}
      
      {/* 1. Deep Space Grid Floor - Perspective effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ perspective: '1000px' }}>
        <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,#57a6ff_100%)] opacity-10" 
             style={{ transform: 'rotateX(60deg) scale(2)', transformOrigin: 'bottom' }}></div>
        <div className="w-[200%] h-[200%] -ml-[50%] -mt-[50%] absolute bg-[size:60px_60px] 
             bg-[linear-gradient(to_right,#1a202c_1px,transparent_1px),linear-gradient(to_bottom,#1a202c_1px,transparent_1px)] 
             animate-grid-move opacity-20"></div>
      </div>

      {/* 2. Vertical Data Streams (Rain) */}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        {[...Array(10)].map((_, i) => (
            <div 
                key={i}
                className="absolute top-0 w-[1px] bg-gradient-to-b from-transparent via-primary to-transparent animate-data-rain"
                style={{
                    left: `${i * 10 + Math.random() * 10}%`,
                    height: `${Math.random() * 50 + 20}%`,
                    animationDuration: `${Math.random() * 2 + 1}s`,
                    animationDelay: `${Math.random() * 2}s`
                }}
            />
        ))}
      </div>

      {/* --- CORE VISUALS --- */}

      <div className="relative z-10 flex flex-col items-center">
        
        {/* THE QUANTUM GYROSCOPE */}
        <div className="relative w-64 h-64 mb-16 perspective-3d">
            
            {/* Core Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/20 rounded-full blur-[60px] animate-pulse-slow"></div>

            {/* Ring 1 - Outer */}
            <div className="absolute inset-0 border-[2px] border-primary/30 rounded-full animate-spin-3d-1 shadow-[0_0_15px_rgba(87,166,255,0.3)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#fff]"></div>
            </div>

            {/* Ring 2 - Middle (Counter rotate) */}
            <div className="absolute inset-4 border-[1px] border-secondary/40 rounded-full animate-spin-3d-2 border-dashed"></div>

            {/* Ring 3 - Inner (X-Axis rotate) */}
            <div className="absolute inset-10 border-[4px] border-transparent border-t-primary/80 border-b-primary/80 rounded-full animate-spin-3d-3"></div>

            {/* Center Nucleus */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/80 border border-white/20 backdrop-blur-md flex items-center justify-center rounded-lg shadow-inner">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-700 rounded-full animate-ping opacity-75"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>
            </div>
        </div>

        {/* --- STATUS TEXT WITH DECODING EFFECT --- */}
        <div className="text-center space-y-3 relative">
            <div className="absolute -left-12 top-1/2 w-8 h-[1px] bg-gray-700"></div>
            <div className="absolute -right-12 top-1/2 w-8 h-[1px] bg-gray-700"></div>

            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(87,166,255,0.8)]">
                <ScrambleText text={status} />
            </h2>
            
            <div className="flex items-center justify-center gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full animate-blink"></div>
                <p className="text-secondary/90 text-sm md:text-base font-bold tracking-[0.3em] uppercase">
                   <ScrambleText text={subStatus} />
                </p>
                <div className="w-2 h-2 bg-secondary rounded-full animate-blink"></div>
            </div>
        </div>

      </div>

      {/* --- HUD ELEMENTS CORNERS --- */}
      <div className="absolute top-8 left-8 border-t-2 border-l-2 border-white/20 w-16 h-16"></div>
      <div className="absolute top-8 right-8 border-t-2 border-r-2 border-white/20 w-16 h-16"></div>
      <div className="absolute bottom-8 left-8 border-b-2 border-l-2 border-white/20 w-16 h-16"></div>
      <div className="absolute bottom-8 right-8 border-b-2 border-r-2 border-white/20 w-16 h-16"></div>

      {/* --- SYSTEM LOGS (FAKE) --- */}
      <div className="absolute bottom-10 left-12 text-[9px] md:text-[10px] text-gray-500 font-mono leading-tight opacity-60 hidden sm:block text-left">
          <div><span className="text-primary">{t.loader.sys_root}</span> :: {t.loader.init_handshake}</div>
          <div><span className="text-primary">{t.loader.mem_alloc}</span> :: 0x994F8A2 {t.loader.reserved}</div>
          <div><span className="text-secondary">{t.loader.bio_metrics}</span> :: <span className="animate-pulse">{t.loader.capturing}</span></div>
          <div><span className="text-gray-600">{t.loader.encryption}</span> :: AES-256-GCM / RSA-4096</div>
      </div>

      <div className="absolute bottom-10 right-12 text-right">
          <div className="text-3xl font-bold text-gray-800 animate-pulse">88.4%</div>
          <div className="text-[9px] text-gray-600 tracking-widest uppercase">{t.loader.confidence}</div>
      </div>

      {/* --- GLOBAL CSS STYLES FOR ANIMATION --- */}
      <style>{`
        .perspective-container {
            perspective: 1200px;
        }
        .perspective-3d {
            transform-style: preserve-3d;
        }
        @keyframes grid-move {
            0% { transform: translateY(0); }
            100% { transform: translateY(60px); }
        }
        @keyframes data-rain {
            0% { transform: translateY(-100%); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes spin-3d-1 {
            0% { transform: rotateX(70deg) rotateZ(0deg); }
            100% { transform: rotateX(70deg) rotateZ(360deg); }
        }
        @keyframes spin-3d-2 {
            0% { transform: rotateY(60deg) rotateZ(0deg); }
            100% { transform: rotateY(60deg) rotateZ(-360deg); }
        }
        @keyframes spin-3d-3 {
            0% { transform: rotate3d(1, 1, 1, 0deg); }
            100% { transform: rotate3d(1, 1, 1, 360deg); }
        }
        @keyframes pulse-slow {
            0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.2); }
        }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        .animate-grid-move {
            animation: grid-move 2s linear infinite;
        }
        .animate-data-rain {
            animation: data-rain 3s linear infinite;
        }
        .animate-spin-3d-1 {
            animation: spin-3d-1 4s linear infinite;
        }
        .animate-spin-3d-2 {
            animation: spin-3d-2 6s linear infinite;
        }
        .animate-spin-3d-3 {
            animation: spin-3d-3 8s linear infinite;
        }
        .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-blink {
            animation: blink 1s steps(2) infinite;
        }
      `}</style>
    </div>
  );
};

export default VerificationLoader;