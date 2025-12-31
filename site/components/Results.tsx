import React, { useState } from 'react';
import { SessionData } from '../types';
import { getSessionHistory, clearTrainingData } from '../utils/storage';
import { downloadSessionJson } from '../utils/fileDownloader';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import VerificationLoader from './VerificationLoader';
import Verdict from './Verdict';
import FinalGrade from './FinalGrade';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  data: SessionData[];
  onReset: () => void;
}

const Results: React.FC<Props> = ({ data, onReset }) => {
  const { t } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState(t.results.verifying.init);
  const [verifySubStatus, setVerifySubStatus] = useState(t.results.verifying.handshake);
  
  // State for the final verdict result
  const [verdictData, setVerdictData] = useState<{ score: number; isHuman: boolean } | null>(null);
  
  // State to show the Final Grade (Meteo) page
  const [showGradePage, setShowGradePage] = useState(false);

  // Visualize the current user's trace session
  const traceSession = data.find(s => s.taskId === 'trace');
  const chartData = traceSession?.events.map((e, i) => {
    if (i === 0) return { time: 0, speed: 0 };
    const prev = traceSession.events[i-1];
    const dist = Math.sqrt(Math.pow(e.x - prev.x, 2) + Math.pow(e.y - prev.y, 2));
    const dt = e.t - prev.t;
    return {
      time: Math.round(e.t),
      speed: dt > 0 ? (dist/dt).toFixed(2) : 0
    };
  }) || [];

  const handleExportHistory = (taskId: string) => {
    const history = getSessionHistory(taskId);
    if (history.length === 0) {
      alert(`No history data found for ${taskId}`);
      return;
    }
    downloadSessionJson(history, `history_${taskId}.json`);
  };

  const handleExportCurrent = (taskId: string) => {
    const session = data.find(s => s.taskId === taskId);
    if (!session) {
      alert(`No current session data found for ${taskId}`);
      return;
    }
    downloadSessionJson(session, `current_${taskId}.json`);
  };

  // --- LOGIC FOR PYTHON API VERIFICATION ---
  const handleVerify = async () => {
    setIsVerifying(true);
    setVerdictData(null);
    setShowGradePage(false);
    
    // Accumulate scores from API. 
    // API Rule: High Score (>0.5) = BOT. Low Score (<0.5) = HUMAN.
    let finalScore = 0;
    let finalDecision = false; // Default to Bot

    // Helper to send data (Using Secure Reverse lookup to get latest session)
    const sendToPython = async (taskName: string, jsonData: any) => {
        try {
            console.log(`Sending payload for ${taskName}:`, JSON.stringify(jsonData).slice(0, 100) + "...");
            
            const response = await fetch(`http://localhost:8000/analyze/${taskName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData),
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log(`API Result [${taskName}]:`, result);
                return result;
            } else {
                console.warn(`API Warning for ${taskName}:`, response.statusText);
            }
        } catch (error) {
            console.error(`Failed to send ${taskName} to Python backend:`, error);
        }
        return null;
    };

    try {
        // Use [...data].reverse().find(...) to ensure we get the VERY LATEST session for the task
        // preventing any stale data from previous attempts.
        
        // 1. Send PUZZLE
        setVerifyStatus(t.results.verifying.neural);
        setVerifySubStatus(t.results.verifying.transmit_puzzle);
        
        const puzzleData = [...data].reverse().find(s => s.taskId === 'puzzle');
        if (puzzleData) await sendToPython('puzzle', puzzleData);
        else console.warn("No puzzle data to send");

        // Wait 3 seconds
        await new Promise(r => setTimeout(r, 2000));

        // 2. Send IMAGE
        setVerifyStatus(t.results.verifying.semantic);
        setVerifySubStatus(t.results.verifying.sync_image);
        
        const imageData = [...data].reverse().find(s => s.taskId === 'image-select');
        if (imageData) await sendToPython('image_select', imageData);
        else console.warn("No image data to send");

        // Wait 3 seconds
        await new Promise(r => setTimeout(r, 2000));

        // 3. Send TRACE (Final Check)
        setVerifyStatus(t.results.verifying.finalizing);
        setVerifySubStatus(t.results.verifying.decrypt_trace);
        
        const traceData = [...data].reverse().find(s => s.taskId === 'trace');
        let traceResult = null;
        if (traceData) {
           traceResult = await sendToPython('trace', traceData);
        }

        // --- DETERMINE VERDICT ---
        // Logic: Score > 0.5 is BOT. Score < 0.5 is HUMAN.
        
        if (traceResult && typeof traceResult.score === 'number') {
            finalScore = traceResult.score;
            // Explicit check: is_human override OR score threshold
            if (traceResult.is_human !== undefined) {
                finalDecision = traceResult.is_human;
            } else {
                finalDecision = finalScore < 0.5;
            }
        } else if (traceResult && typeof traceResult.confidence === 'number') {
            finalScore = traceResult.confidence;
            if (traceResult.is_human !== undefined) {
                finalDecision = traceResult.is_human;
            } else {
                finalDecision = finalScore < 0.5;
            }
        } else {
            // FALLBACK (Offline mode): 
            // We calculate a synthetic BOT SCORE.
            console.warn("Using local fallback scoring (API unreachable or invalid format)");
            
            const efficiency = traceData?.metrics?.pathEfficiency || 0;
            const jitter = traceData?.metrics?.jitter || 0;
            const puzzleSuccess = puzzleData?.outcome?.success;
            const imageSuccess = imageData?.outcome?.success;
            
            // Default to uncertain
            let botScore = 0.5;

            // If tasks failed -> Likely Bot
            if (!puzzleSuccess || !imageSuccess) {
                botScore = 0.90; 
            } else {
                 // Check Trace metrics
                 // Bot behavior = High efficiency (straight lines) AND Low Jitter (perfect movement)
                 // Human behavior = Lower efficiency AND Higher jitter
                 
                 // If too perfect -> Bot
                 if (efficiency > 0.95 && jitter < 1.0) {
                     botScore = 0.95; 
                 } else {
                     // Imperfect (Human)
                     botScore = 0.05; 
                 }
            }
            
            finalScore = botScore;
            finalDecision = botScore < 0.5; // Human if Bot Score is low
        }

        // Short final delay for effect
        await new Promise(r => setTimeout(r, 1500));
        
        setVerifyStatus(finalDecision ? t.results.verifying.human_verif : t.results.verifying.bot_detect);
        setVerifySubStatus(finalDecision ? t.results.verifying.welcome : t.results.verifying.access_denied);
        await new Promise(r => setTimeout(r, 1500));
        
        // Set data to trigger view switch
        setVerdictData({ score: finalScore, isHuman: finalDecision });

    } catch (e) {
        console.error("Verification sequence interrupted", e);
        setVerifyStatus(t.results.verifying.error);
        setVerifySubStatus(t.results.verifying.lost);
        await new Promise(r => setTimeout(r, 2000));
        // Fallback to bot to be safe on error
        setVerdictData({ score: 1.0, isHuman: false });
    } finally {
        setIsVerifying(false);
    }
  };

  // --- RESULT VIEW ---
  
  // 1. If Final Grade Page requested via "Suite" button
  if (showGradePage) {
      return <FinalGrade onRestart={onReset} />;
  }

  // 2. If Verdict (Analysis complete)
  if (verdictData) {
    return (
        <Verdict 
            score={verdictData.score} 
            isHuman={verdictData.isHuman} 
            onRestart={onReset} 
            onNext={() => setShowGradePage(true)} // Enable next page
        />
    );
  }

  // 3. Main Dashboard
  return (
    <>
      {isVerifying && (
        <VerificationLoader status={verifyStatus} subStatus={verifySubStatus} />
      )}

      <div className="w-full max-w-4xl animate-fade-in pb-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-secondary mb-2">{t.results.complete_title}</h1>
          <p className="text-gray-400">{t.results.complete_desc}</p>
        </div>

        {/* --- MAIN ACTION BUTTONS --- */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <button
                onClick={handleVerify}
                className="relative overflow-hidden group px-12 py-5 bg-gradient-to-r from-primary/90 to-blue-600 text-white font-bold text-xl rounded-xl shadow-[0_0_30px_rgba(87,166,255,0.3)] transition-all hover:scale-105 active:scale-95"
            >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                <span className="relative flex items-center gap-3">
                    <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t.results.btn_verify}
                </span>
            </button>

            <button
                onClick={onReset}
                className="px-8 py-5 border-2 border-gray-700 hover:border-white text-gray-300 hover:text-white font-bold text-lg rounded-xl transition-all hover:bg-white/5"
            >
                {t.results.btn_restart}
            </button>
        </div>

        {/* --- DATA VIZ SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-surface border border-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-primary mb-4">{t.results.metrics_title}</h3>
            <div className="space-y-4">
               {data.map((session, idx) => (
                  <div key={idx} className="border-b border-gray-800 pb-2 last:border-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-mono text-gray-400 uppercase">{session.taskId}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${session.outcome.success ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {session.outcome.success ? t.results.pass : t.results.fail}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div>Efficiency: {session.metrics.pathEfficiency.toFixed(2)}</div>
                      <div>Jitter: {session.metrics.jitter.toFixed(1)}</div>
                    </div>
                  </div>
               ))}
            </div>
          </div>

          <div className="bg-surface border border-gray-800 p-6 rounded-xl flex flex-col">
            <h3 className="text-lg font-bold text-primary mb-4">{t.results.velocity_title}</h3>
            <div className="flex-1 min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={[0, 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161a20', border: '1px solid #333' }}
                    itemStyle={{ color: '#57a6ff' }}
                  />
                  <Line type="monotone" dataKey="speed" stroke="#57a6ff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- EXPORTS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">{t.results.export_manual}</h3>
                <div className="flex gap-2">
                    <button onClick={() => handleExportCurrent('puzzle')} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition">Puzzle .JSON</button>
                    <button onClick={() => handleExportCurrent('image-select')} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition">Image .JSON</button>
                    <button onClick={() => handleExportCurrent('trace')} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition">Trace .JSON</button>
                </div>
            </div>

            <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">{t.results.export_training}</h3>
                 <div className="flex gap-2">
                    <button onClick={() => handleExportHistory('puzzle')} className="flex-1 py-2 bg-gray-900 border border-gray-700 hover:border-secondary rounded text-xs text-secondary transition">All Puzzles</button>
                    <button onClick={() => handleExportHistory('image-select')} className="flex-1 py-2 bg-gray-900 border border-gray-700 hover:border-secondary rounded text-xs text-secondary transition">All Images</button>
                    <button onClick={() => handleExportHistory('trace')} className="flex-1 py-2 bg-gray-900 border border-gray-700 hover:border-secondary rounded text-xs text-secondary transition">All Traces</button>
                </div>
            </div>
        </div>
        
        <div className="mt-8 text-center">
             <button onClick={clearTrainingData} className="text-[10px] text-red-900 hover:text-red-600 transition">{t.results.reset_storage}</button>
        </div>
      </div>
    </>
  );
};

export default Results;