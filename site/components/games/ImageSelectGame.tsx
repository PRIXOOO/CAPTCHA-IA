import React, { useState, useEffect } from 'react';
import { tracker } from '../../utils/tracker';
import { SessionData } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  onComplete: (data: SessionData) => void;
}

interface GameItem {
  id: string;
  label: string; // 'Cat', 'Dog', 'Car', 'Bird'
  isTarget: boolean;
  imageUrl: string;
}

// Markers for dynamic fetching
const API_CAT = 'FETCH_THE_CAT_API';
const API_DOG = 'FETCH_THE_DOG_API';
const API_CAR = 'FETCH_THE_CAR_API';

const IMAGE_DATABASE = [
  // --- CATS ---
  { id: 'c1', label: 'Cat', imageUrl: API_CAT }, 
  { id: 'c2', label: 'Cat', imageUrl: 'https://i.pinimg.com/474x/c0/65/4d/c0654def83135b5eb2d7af17b15d145c.jpg' },
  { id: 'c3', label: 'Cat', imageUrl: 'https://www.shutterstock.com/image-photo/ugly-cat-march-2-2024-260nw-2432548031.jpg' },
  { id: 'c4', label: 'Cat', imageUrl: API_CAT },
  { id: 'c5', label: 'Cat', imageUrl: API_CAT },
  { id: 'c6', label: 'Cat', imageUrl: 'https://www.forgoodtime.fr/media/cache/conversions/breeder/1138/breeding/for-good-time-cattery/animal/exotic-shorthair-tess/photos/87158/chat-exotic-shorthair-tess-for-good-time-cattery-0-medium.jpg' },

  // --- DOGS ---
  { id: 'd1', label: 'Dog', imageUrl: API_DOG },
  { id: 'd2', label: 'Dog', imageUrl: 'https://c7.alamy.com/comp/2N3B9HX/a-closeup-of-a-shiba-inu-dog-pooping-outdoors-2N3B9HX.jpg' },
  { id: 'd3', label: 'Dog', imageUrl: API_DOG },
  { id: 'd4', label: 'Dog', imageUrl: 'https://content.imageresizer.com/images/memes/ugly-dog-20-meme-2.jpg' },
  { id: 'd5', label: 'Dog', imageUrl: API_DOG },
  
  // --- CARS (Originals) ---
  { id: 'v1', label: 'Car', imageUrl: 'https://i0.wp.com/pdlv.fr/wp-content/uploads/2025/03/voiture-oui-oui-vendue-encheres.jpg?fit=1200%2C723&ssl=1' },
  { id: 'v2', label: 'Car', imageUrl: 'https://i.pinimg.com/736x/33/ac/8e/33ac8eb25321c5bc5b5e4d3c6d94d25b.jpg' },
  { id: 'v3', label: 'Car', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_83sPce0JckmQru4HlVsB11XyG75hFo-yNQ&s' },
  // --- CARS (New dynamic) ---
  { id: 'v4', label: 'Car', imageUrl: 'https://cdn.prod.website-files.com/6864d666097819db1fc2600f/68d0f5e3f490a79160ce817b_642eca99cd275c98cc641a1d_c1a58d9b-29fd-4b41-8a47-22cab1c6eae9_citroen-amy-voiture-sans-permis.jpeg' },
  { id: 'v5', label: 'Car', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Fiat_Multipla_%282002%29_%2829392161886%29.jpg/1200px-Fiat_Multipla_%282002%29_%2829392161886%29.jpg' },
  { id: 'v6', label: 'Car', imageUrl: 'https://i.f1g.fr/media/figaro/1200x630_crop/2016/07/13/XVMb96ea12c-429e-11e6-be92-6642240b8ece.jpg' },
  { id: 'v7', label: 'Car', imageUrl: 'https://i.redd.it/cfd57ce01kib1.jpg' },
  { id: 'v8', label: 'Car', imageUrl: 'https://i.redd.it/ui7apeekvz8d1.jpeg' },
  { id: 'v9', label: 'Car', imageUrl: 'https://www.voiture-de-golf.com/wp-content/mediafiles/2023/10/ZELEC-GC-A2B-1-e1734548024161.jpg' },
  { id: 'v10', label: 'Car', imageUrl: 'https://external-preview.redd.it/tested-the-2025-volkswagen-golf-r-is-a-hot-hatch-for-grown-v0-o9IsPafXgSRvtVbnQpGYaMFuXnZs88ifaae-kUDoizo.jpeg?auto=webp&s=c6366d545cd09d40a6bbd05dda4a643c08488db8'},
  // --- BIRDS ---
  { id: 'b1', label: 'Bird', imageUrl: 'https://i.pinimg.com/736x/9e/be/03/9ebe036819510dc8c569a026dc60ec3c.jpg' },
  { id: 'b2', label: 'Bird', imageUrl: 'https://www.boredpanda.com/blog/wp-content/uploads/2022/05/30-6283792741243__700.jpg?utm_campaign=rebelboost_true'},
  { id: 'b3', label: 'Bird', imageUrl: 'https://a-z-animals.com/media/2022/12/shutterstock_1170921268.jpg' },
  { id: 'b4', label: 'Bird', imageUrl: 'https://images.pexels.com/photos/31853411/pexels-photo-31853411/free-photo-of-close-up-of-a-whimsical-seriema-bird-in-nature.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
];

const ImageSelectGame: React.FC<Props> = ({ onComplete }) => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<GameItem[]>([]);
  const [targetCategory, setTargetCategory] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Helper to translate category names
  const getTranslatedCategory = (cat: string) => {
    switch (cat) {
      case 'Cat': return t.image.cats;
      case 'Dog': return t.image.dogs;
      case 'Car': return t.image.cars;
      case 'Bird': return t.image.birds;
      default: return cat;
    }
  };

  useEffect(() => {
    const initGame = async () => {
      const availableCategories = Array.from(new Set(IMAGE_DATABASE.map(item => item.label)));
      const target = availableCategories[Math.floor(Math.random() * availableCategories.length)];
      setTargetCategory(target);

      const potentialTargets = IMAGE_DATABASE.filter(item => item.label === target);
      const potentialDistractors = IMAGE_DATABASE.filter(item => item.label !== target);

      const targetCount = Math.min(potentialTargets.length, 3 + Math.floor(Math.random() * 2));
      const totalCount = 9;

      const selectedTargets = potentialTargets
        .sort(() => 0.5 - Math.random())
        .slice(0, targetCount)
        .map(item => ({ ...item, isTarget: true }));

      const distractorCount = totalCount - selectedTargets.length;
      const selectedDistractors = potentialDistractors
        .sort(() => 0.5 - Math.random())
        .slice(0, distractorCount)
        .map(item => ({ ...item, isTarget: false }));

      const rawGrid = [...selectedTargets, ...selectedDistractors]
        .sort(() => 0.5 - Math.random());

      // Resolving dynamic images
      const resolvedGrid = await Promise.all(rawGrid.map(async (item) => {
        let finalUrl = item.imageUrl;
        
        // --- CAT API ---
        if (item.imageUrl === API_CAT) {
          try {
            const res = await fetch('https://api.thecatapi.com/v1/images/search?limit=1&mime_types=jpg,png');
            const data = await res.json();
            if (data && data[0] && data[0].url) finalUrl = data[0].url;
            else finalUrl = `https://loremflickr.com/300/300/cat?lock=${Math.random()}`;
          } catch (e) {
            finalUrl = `https://loremflickr.com/300/300/cat?lock=${Math.random()}`;
          }
        } 
        // --- DOG API ---
        else if (item.imageUrl === API_DOG) {
          try {
            const res = await fetch('https://api.thedogapi.com/v1/images/search?limit=1&mime_types=jpg,png');
            const data = await res.json();
            if (data && data[0] && data[0].url) finalUrl = data[0].url;
            else finalUrl = `https://loremflickr.com/300/300/dog?lock=${Math.random()}`;
          } catch (e) {
            finalUrl = `https://loremflickr.com/300/300/dog?lock=${Math.random()}`;
          }
        }
        // --- CAR API ---
        else if (item.imageUrl === API_CAR) {
          try {
             // Attempt to use the requested API
             const res = await fetch('https://api.auto-data.net/image-database');
             // Note: Most public APIs require specific endpoints/keys. 
             // If this returns standard JSON with an image url, it will work.
             const data = await res.json();
             if (data && data.url) finalUrl = data.url; 
             else if (data && data[0] && data[0].url) finalUrl = data[0].url;
             else throw new Error("API structure mismatch or auth required");
          } catch (e) {
             // Robust fallback to ensure the user always sees a car image
             finalUrl = `https://loremflickr.com/300/300/car?lock=${Math.random()}`;
          }
        }

        return { ...item, imageUrl: finalUrl };
      }));

      setItems(resolvedGrid);
      setIsReady(true);
      tracker.start();
    };

    initGame();

    const handleGlobalMove = (e: MouseEvent) => tracker.track(e.clientX, e.clientY);
    window.addEventListener('mousemove', handleGlobalMove);
    return () => {
      tracker.stop();
      window.removeEventListener('mousemove', handleGlobalMove);
    };
  }, []);

  const toggleItem = (id: string) => {
    // Clear error when user interacts
    if (errorFeedback) setErrorFeedback(null);
    
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  const handleSubmit = () => {
    // LOGIC UPDATE (User Request):
    // "Laissez passer une marge d'erreur"
    // We analyze the selection to see if it's "Human Enough".
    
    const selectedIds = Array.from(selected);
    
    // Identify what was clicked
    const selectedItems = selectedIds.map(id => items.find(i => i.id === id)).filter(Boolean) as GameItem[];
    
    const incorrectSelectionsCount = selectedItems.filter(i => !i.isTarget).length;
    const correctSelectionsCount = selectedItems.filter(i => i.isTarget).length;
    
    // Total available targets in the grid
    const totalTargetsAvailable = items.filter(i => i.isTarget).length;

    // BARRIER 1: No effort (Empty selection or no targets found)
    if (correctSelectionsCount === 0) {
        setErrorFeedback(t.image.error_empty);
        return;
    }

    // BARRIER 2: Too many mistakes (Spamming)
    // We allow up to 1 "ambiguous" mistake. 2 or more is likely random clicking or bot behavior.
    if (incorrectSelectionsCount > 1) {
         setErrorFeedback(`${t.image.error_category} "${getTranslatedCategory(targetCategory)}".`);
         return;
    }

    // SUCCESS LOGIC:
    // If we passed the barriers above, we consider it a success for the purpose of the UI flow.
    // Even if they missed a target or clicked 1 wrong image, we let them proceed.
    
    // Note: We flag success=true here because for a human, selecting 3 cats and 1 dog (ambiguous) 
    // is often a "pass" in modern captcha systems compared to a bot.
    const isSuccess = true;

    const metrics = tracker.computeMetrics();
    const sessionResult: SessionData = {
      sessionId: crypto.randomUUID(),
      taskId: 'image-select',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screen: { width: window.innerWidth, height: window.innerHeight },
      events: tracker.getEvents(),
      metrics,
      outcome: { 
        success: isSuccess, 
        details: { 
            target: targetCategory, 
            found: correctSelectionsCount,
            mistakes: incorrectSelectionsCount,
            total: totalTargetsAvailable
        } 
      }
    };

    localStorage.setItem('image-select-session', JSON.stringify(sessionResult));
    onComplete(sessionResult);
  };

  if (!isReady) return (
    <div className="flex flex-col items-center justify-center w-[480px] h-[400px]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="text-primary text-xs animate-pulse font-mono">{t.image.loading}</div>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-[480px] animate-fade-in">
      <h2 className="text-xl font-bold mb-2 text-white">{t.image.title}</h2>
      <p className="mb-4 text-muted text-sm text-center">
        {t.image.instr_prefix} <strong className="text-white">{t.image.instr_suffix}</strong> <strong className="text-secondary uppercase">{getTranslatedCategory(targetCategory)}</strong>.
      </p>

      {/* Error Feedback Area */}
      <div className={`h-6 mb-2 text-xs font-mono transition-opacity duration-300 ${errorFeedback ? 'opacity-100' : 'opacity-0'}`}>
         <span className="text-danger bg-danger/10 px-2 py-1 rounded border border-danger/20">
            {errorFeedback || "..."}
         </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6 w-full">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`
              relative aspect-square rounded-lg overflow-hidden cursor-pointer
              transition-all duration-150 border-2 group bg-gray-900
              ${selected.has(item.id) 
                ? 'border-primary shadow-[0_0_15px_rgba(87,166,255,0.4)]' 
                : 'border-gray-800 hover:border-gray-600'}
            `}
          >
            <img 
              src={item.imageUrl} 
              alt={item.label}
              className={`w-full h-full object-cover transition-transform duration-300 ${selected.has(item.id) ? 'scale-110 opacity-70' : 'group-hover:scale-105'}`}
              loading="lazy"
            />
            {selected.has(item.id) && (
              <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
                <div className="bg-primary rounded-full p-1 shadow-xl">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full px-8 py-3 bg-primary text-black font-bold rounded-lg hover:bg-blue-400 transition-colors shadow-lg active:scale-95 text-base"
      >
        {t.image.verify_btn}
      </button>
    </div>
  );
};

export default ImageSelectGame;