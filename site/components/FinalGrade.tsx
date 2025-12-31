import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  onRestart: () => void;
}

type WeatherState = 'storm' | 'rain' | 'gloomy' | 'cloudy' | 'sunny';

const FinalGrade: React.FC<Props> = ({ onRestart }) => {
  const { t } = useLanguage();
  const [score, setScore] = useState(12);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Weather State Logic
  const getWeatherState = (s: number): WeatherState => {
    if (s < 5) return 'storm';
    if (s < 10) return 'rain';
    if (s < 14) return 'gloomy';
    if (s < 20) return 'cloudy';
    return 'sunny';
  };

  const weather = getWeatherState(score);

  // --- Confetti Engine (Only for 20/20) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: any[] = [];
    
    // Only active if Sunny (20/20)
    if (score === 20) {
        const colors = ['#FFD700', '#FFA500', '#FFFFFF', '#87CEEB', '#FF69B4'];
        
        const createParticle = () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          size: Math.random() * 8 + 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedY: Math.random() * 5 + 3,
          speedX: Math.random() * 4 - 2,
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 10 - 5
        });

        // Burst on entry
        for(let i=0; i<150; i++) particles.push(createParticle());

        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (Math.random() < 0.2) particles.push(createParticle());

          particles.forEach((p, index) => {
             p.y += p.speedY;
             p.x += p.speedX;
             p.rotation += p.rotationSpeed;
             
             if (p.y > canvas.height) particles[index] = createParticle();

             ctx.save();
             ctx.translate(p.x, p.y);
             ctx.rotate(p.rotation * Math.PI / 180);
             ctx.fillStyle = p.color;
             ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
             ctx.restore();
          });
          animationId = requestAnimationFrame(animate);
        };
        animate();
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => cancelAnimationFrame(animationId);
  }, [score]);

  // --- Background Styles ---
  const getBackgroundClass = () => {
    switch(weather) {
        case 'storm': return 'bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e]'; // Dark Purple/Black
        case 'rain': return 'bg-gradient-to-b from-[#141E30] to-[#243B55]'; // Dark Blue/Grey
        case 'gloomy': return 'bg-gradient-to-b from-[#3E5151] to-[#DECBA4]'; // Grey/Beige
        case 'cloudy': return 'bg-gradient-to-b from-[#2980B9] to-[#6DD5FA]'; // Light Blue
        case 'sunny': return 'bg-gradient-to-br from-[#00c6ff] to-[#0072ff]'; // Bright Blue
        default: return 'bg-black';
    }
  };

  return (
    <div className={`relative w-full h-[700px] flex flex-col items-center justify-between overflow-hidden rounded-xl shadow-2xl transition-all duration-1000 ${getBackgroundClass()}`}>
      
      {/* --- WEATHER LAYERS --- */}
      
      {/* 1. Lightning Overlay (Storm) */}
      {weather === 'storm' && (
         <div className="absolute inset-0 bg-white opacity-0 animate-lightning pointer-events-none z-10"></div>
      )}

      {/* 2. Sun (Sunny) */}
      {weather === 'sunny' && (
         <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-yellow-300 rounded-full blur-[40px] opacity-80 animate-pulse-slow"></div>
      )}

      {/* 3. Clouds (Gloomy / Cloudy) */}
      {(weather === 'gloomy' || weather === 'cloudy') && (
         <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className={`absolute top-10 -left-20 w-40 h-16 bg-white/30 rounded-full blur-xl animate-cloud-move opacity-${weather === 'gloomy' ? '50' : '80'}`}></div>
            <div className={`absolute top-32 -right-20 w-60 h-20 bg-white/20 rounded-full blur-xl animate-cloud-move-slow opacity-${weather === 'gloomy' ? '80' : '60'}`}></div>
         </div>
      )}

      {/* 4. Rain (Storm / Rain) */}
      {(weather === 'storm' || weather === 'rain') && (
          <div className="absolute inset-0 z-0 flex justify-center pointer-events-none overflow-hidden">
             {/* Simple CSS Rain simulation using repeating gradients or multiple elements is safer than canvas for this overlay context */}
             {[...Array(20)].map((_, i) => (
                 <div key={i} className="absolute top-0 w-[2px] bg-white/30 animate-rain-drop" 
                      style={{
                          left: `${Math.random() * 100}%`,
                          height: `${Math.random() * 20 + 10}%`,
                          animationDuration: `${0.5 + Math.random() * 0.5}s`,
                          animationDelay: `${Math.random()}s`
                      }}
                 ></div>
             ))}
          </div>
      )}

      {/* Confetti Canvas */}
      <canvas ref={canvasRef} width={500} height={700} className="absolute inset-0 pointer-events-none z-20" />

      {/* --- CONTENT --- */}

      <div className="relative z-30 w-full flex flex-col items-center pt-16 px-8 text-center">
        <h1 className="text-4xl font-black text-white drop-shadow-lg mb-2">{t.grade.title}</h1>
        <p className="text-white/80 font-medium mb-10">{t.grade.subtitle}</p>

        {/* Dynamic Icon based on weather */}
        <div className="w-32 h-32 mb-8 transition-transform duration-500 hover:scale-110 drop-shadow-2xl">
            {weather === 'storm' && <span className="text-8xl">⛈️</span>}
            {weather === 'rain' && <span className="text-8xl">🌧️</span>}
            {weather === 'gloomy' && <span className="text-8xl">☁️</span>}
            {weather === 'cloudy' && <span className="text-8xl">⛅</span>}
            {weather === 'sunny' && <span className="text-8xl">☀️</span>}
        </div>

        {/* Score Display */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-sm mb-8 shadow-xl">
             <div className="flex justify-between items-end mb-4">
                 <span className="text-white/60 text-sm font-bold uppercase">{t.grade.score_label}</span>
                 <span className={`text-5xl font-black ${score === 20 ? 'text-yellow-300' : 'text-white'}`}>{score}/20</span>
             </div>
             
             <input 
                type="range"
                min="0"
                max="20"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full h-4 bg-gray-700/50 rounded-lg appearance-none cursor-pointer accent-white hover:accent-secondary transition-all"
             />
             <div className="flex justify-between mt-2 text-[10px] text-white/50 font-mono">
                 <span>0 (Storm)</span>
                 <span>10 (Rain)</span>
                 <span>14 (Cloud)</span>
                 <span>20 (Sun)</span>
             </div>
        </div>

      </div>

      {/* --- FOOTER / RESTART --- */}
      <div className="relative z-30 w-full p-8 pb-12 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center">
         <button
            onClick={onRestart}
            className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-transform mb-4"
         >
            {t.grade.btn_restart}
         </button>
         <p className="text-[10px] text-white/40 text-center max-w-xs leading-tight">
            {t.grade.disclaimer}
         </p>
      </div>

      {/* Styles for animations */}
      <style>{`
         @keyframes lightning {
            0%, 90% { opacity: 0; }
            92% { opacity: 0.8; }
            94% { opacity: 0; }
            96% { opacity: 0.8; }
            100% { opacity: 0; }
         }
         .animate-lightning {
            animation: lightning 5s infinite;
         }
         @keyframes rain-drop {
            0% { transform: translateY(-100vh); }
            100% { transform: translateY(100vh); }
         }
         .animate-rain-drop {
            animation: rain-drop 1s linear infinite;
         }
         @keyframes cloud-move {
            0% { transform: translateX(0); }
            50% { transform: translateX(20px); }
            100% { transform: translateX(0); }
         }
         .animate-cloud-move {
            animation: cloud-move 10s ease-in-out infinite;
         }
         .animate-cloud-move-slow {
             animation: cloud-move 15s ease-in-out infinite reverse;
         }
      `}</style>
    </div>
  );
};

export default FinalGrade;