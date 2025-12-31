import React, { useRef, useState, useEffect } from 'react';
import { tracker } from '../../utils/tracker';
import { SessionData } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  onComplete: (data: SessionData) => void;
}

const PuzzleGame: React.FC<Props> = ({ onComplete }) => {
  const { t } = useLanguage();
  
  // Store initial position to reset if user fails hard
  const [initialPos] = useState(() => {
    const maxX = 420; 
    const maxY = 240; 
    const targetX = 220;
    const targetY = 120;
    const minDistance = 100; 

    let randomX, randomY, distance;
    let attempts = 0;

    do {
      randomX = Math.floor(Math.random() * maxX);
      randomY = Math.floor(Math.random() * maxY);
      distance = Math.sqrt(Math.pow(randomX - targetX, 2) + Math.pow(randomY - targetY, 2));
      attempts++;
    } while (distance < minDistance && attempts < 50);

    return { x: randomX, y: randomY };
  });

  const [position, setPosition] = useState(initialPos);
  const [isDragging, setIsDragging] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const dragStartRef = useRef<{ 
    initialMouseX: number; 
    initialMouseY: number; 
    initialObjX: number; 
    initialObjY: number 
  } | null>(null);

  useEffect(() => {
    tracker.start();
    return () => tracker.stop();
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setFeedback(null); // Clear error on new attempt
    e.currentTarget.setPointerCapture(e.pointerId);
    
    dragStartRef.current = {
      initialMouseX: e.clientX,
      initialMouseY: e.clientY,
      initialObjX: position.x,
      initialObjY: position.y
    };
    tracker.track(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging && dragStartRef.current && containerRef.current) {
      const deltaX = e.clientX - dragStartRef.current.initialMouseX;
      const deltaY = e.clientY - dragStartRef.current.initialMouseY;
      
      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = rect.width / containerRef.current.offsetWidth || 1;
      const scaleY = rect.height / containerRef.current.offsetHeight || 1;

      const newX = dragStartRef.current.initialObjX + (deltaX / scaleX);
      const newY = dragStartRef.current.initialObjY + (deltaY / scaleY);
      
      const maxX = (containerRef.current.clientWidth) - 48; 
      const maxY = (containerRef.current.clientHeight) - 48;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
      tracker.track(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    tracker.track(e.clientX, e.clientY);

    const targetX = 220;
    const targetY = 120;
    const distance = Math.sqrt(Math.pow(position.x - targetX, 2) + Math.pow(position.y - targetY, 2));
    
    // LOGIC UPDATE:
    // 1. SUCCESS_THRESHOLD (approx 24px): Piece is 48px. If distance < 24, overlap is > 50%. -> SUCCESS & PASS.
    // 2. PROCEED_THRESHOLD (approx 70px): Piece touches or is "close enough" (imprecise). -> FAIL & PASS.
    // 3. HARD_FAIL: Too far away. -> RETRY.

    const SUCCESS_THRESHOLD = 24; 
    const PROCEED_THRESHOLD = 70; 

    if (distance < PROCEED_THRESHOLD) {
        // User is close enough to proceed (either Pass or Fail state)
        const isSuccess = distance < SUCCESS_THRESHOLD;
        
        const metrics = tracker.computeMetrics();
        const sessionResult: SessionData = {
          sessionId: crypto.randomUUID(),
          taskId: 'puzzle',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          screen: { width: window.innerWidth, height: window.innerHeight },
          events: tracker.getEvents(),
          metrics,
          outcome: { 
            success: isSuccess, 
            details: { finalDistance: distance } 
          }
        };
        localStorage.setItem('puzzle-session', JSON.stringify(sessionResult));
        onComplete(sessionResult);

    } else {
        // RETRY (Hard Barrier)
        // If they are way off (troll or completely missed), force retry.
        setFeedback(t.puzzle.feedback_retry);
        
        // Snap back to original position
        setTimeout(() => {
            setPosition(initialPos);
        }, 200);
    }
  };

  return (
    <div className="flex flex-col items-center w-[480px]">
      <h2 className="text-xl font-bold mb-2 text-white">{t.puzzle.title}</h2>
      <p className="mb-6 text-muted text-sm">{t.puzzle.instr}</p>
      
      <div 
        ref={containerRef}
        className="relative w-full h-[300px] bg-surface border-[2px] border-white shadow-[0_0_25px_rgba(255,255,255,0.15)] overflow-hidden box-border"
      >
        <div className="absolute inset-0 pointer-events-none z-50 opacity-80">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white"></div>
        </div>

        {/* Target Zone */}
        <div 
          className="absolute w-12 h-12 border-2 border-dashed border-secondary bg-secondary/10 rounded-lg flex items-center justify-center"
          style={{ left: 220, top: 120 }}
        >
          <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
        </div>

        {/* Feedback Message Overlay */}
        {feedback && (
            <div className="absolute top-4 left-0 right-0 text-center z-40 pointer-events-none">
                <span className="bg-black/80 text-danger border border-danger/50 px-3 py-1 rounded text-xs font-mono animate-pulse">
                    {feedback}
                </span>
            </div>
        )}

        {/* Draggable Piece */}
        <div
          className={`absolute w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg shadow-lg cursor-grab flex items-center justify-center border border-primary/50 transition-all duration-200 ${isDragging ? 'cursor-grabbing scale-110 shadow-primary/30' : ''}`}
          style={{ 
            left: position.x, 
            top: position.y,
            touchAction: 'none',
            // If we are not dragging, animate the reset movement
            transition: isDragging ? 'none' : 'left 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default PuzzleGame;