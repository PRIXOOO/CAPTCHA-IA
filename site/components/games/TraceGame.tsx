import React, { useRef, useEffect, useState } from 'react';
import { tracker } from '../../utils/tracker';
import { SessionData } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  onComplete: (data: SessionData) => void;
}

const TraceGame: React.FC<Props> = ({ onComplete }) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [maxDeviation, setMaxDeviation] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  // Track how much of the path (horizontal width) has been covered
  const coverageRef = useRef<{ min: number; max: number }>({ min: Infinity, max: -Infinity });

  const getPathY = (x: number, height: number) => {
    return (height / 2) + Math.sin(x / 40) * 40;
  };

  const drawLevel = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    const margin = 20;
    for (let x = 0; x <= width; x += 5) {
      ctx.lineTo(x, getPathY(x, height) - margin);
    }
    for (let x = width; x >= 0; x -= 5) {
      ctx.lineTo(x, getPathY(x, height) + margin);
    }
    ctx.closePath();
    ctx.fillStyle = '#161a20';
    ctx.fill();
    ctx.strokeStyle = '#2a2f36';
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#57a6ff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    for (let x = 0; x <= width; x += 5) {
      if (x === 0) ctx.moveTo(x, getPathY(x, height));
      else ctx.lineTo(x, getPathY(x, height));
    }
    ctx.stroke();
    ctx.setLineDash([]);
  };

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    drawLevel(ctx, cvs.width, cvs.height);
    // Note: We don't start tracker here anymore, we start on pointer down for each attempt
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    setFeedback(null); // Clear previous feedback
    e.currentTarget.setPointerCapture(e.pointerId);
    
    // Reset state for new attempt
    coverageRef.current = { min: Infinity, max: -Infinity };
    setMaxDeviation(0);
    
    // Clear Visuals (redraw background to remove previous dots)
    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) drawLevel(ctx, canvasRef.current.width, canvasRef.current.height);
    }

    // Start fresh tracking session for this attempt
    tracker.start();
    tracker.track(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    // Raw coordinates relative to canvas
    const rawX = (e.clientX - rect.left) * scaleX;
    const rawY = (e.clientY - rect.top) * scaleY;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    // Check if pointer is physically within the canvas bounds
    const isInside = rawX >= 0 && rawX <= width && rawY >= 0 && rawY <= height;

    // Clamping for coverage logic (so dragging off the right edge still counts as 100% completion)
    const canvasX = Math.max(0, Math.min(rawX, width));
    
    // We update coverage even if outside, to allow users to "finish" by swiping out
    if (canvasX < coverageRef.current.min) coverageRef.current.min = canvasX;
    if (canvasX > coverageRef.current.max) coverageRef.current.max = canvasX;

    tracker.track(e.clientX, e.clientY);

    // Only draw feedback dots if inside
    if (isInside) {
      const idealY = getPathY(canvasX, height);
      const deviation = Math.abs(rawY - idealY);
      
      if (deviation > maxDeviation) setMaxDeviation(deviation);

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
          ctx.beginPath();
          ctx.arc(canvasX, rawY, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = deviation > 20 ? '#e74c3c' : '#4ecca3';
          ctx.fill();
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Calculate total horizontal distance covered
    const coveredDistance = coverageRef.current.max - coverageRef.current.min;
    const canvasWidth = canvasRef.current?.width || 480;
    const coveragePercent = coveredDistance / canvasWidth;

    // BARRIER: Must cover at least 50% of the path width
    if (coveragePercent < 0.5) {
        setFeedback(t.trace.error_short);
        return; // BLOCK proceeding
    }
    
    // User must cover at least 85% of the canvas width to be considered a "SUCCESS"
    // But if they covered > 50%, we capture the data and proceed (even if it's a fail/bot behavior)
    const hasEnoughCoverage = coveragePercent > 0.85;

    // Success = Low deviation AND High coverage
    const success = maxDeviation < 20 && hasEnoughCoverage;

    const metrics = tracker.computeMetrics();
    const sessionResult: SessionData = {
      sessionId: crypto.randomUUID(),
      taskId: 'trace',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screen: { width: window.innerWidth, height: window.innerHeight },
      events: tracker.getEvents(),
      metrics,
      outcome: { 
        success, 
        details: { 
          maxDeviation, 
          coveragePercent: Math.round(coveragePercent * 100) 
        } 
      }
    };
    localStorage.setItem('trace-session', JSON.stringify(sessionResult));
    onComplete(sessionResult);
  };

  return (
    <div className="flex flex-col items-center w-[480px]">
      <h2 className="text-xl font-bold mb-2 text-white">{t.trace.title}</h2>
      <p className="mb-6 text-muted text-sm">{t.trace.instr}</p>
      
      <div className="relative border-[2px] border-white shadow-[0_0_25px_rgba(255,255,255,0.15)] box-border">
        {/* HUD Corners Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-80">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white"></div>
        </div>

        {/* Feedback Overlay */}
        {feedback && (
            <div className="absolute top-4 left-0 right-0 text-center z-40 pointer-events-none">
                <span className="bg-black/90 text-danger border border-danger/50 px-4 py-2 rounded text-sm font-mono animate-pulse shadow-lg backdrop-blur-sm">
                    {feedback}
                </span>
            </div>
        )}

        <canvas
          ref={canvasRef}
          width={480}
          height={280}
          className="bg-black cursor-crosshair touch-none block"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp} 
        />
        <div className="absolute top-2 right-2 text-xs font-mono text-gray-500 bg-black/60 px-2 py-1 z-20">
           Dev: {maxDeviation.toFixed(1)}px
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-600">{t.trace.release}</p>
    </div>
  );
};

export default TraceGame;