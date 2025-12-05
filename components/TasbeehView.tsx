import React, { useState } from 'react';
import { Theme } from '../types';

interface TasbeehViewProps {
    theme: Theme;
}

export const TasbeehView: React.FC<TasbeehViewProps> = ({ theme }) => {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33); // Common tasbeeh cycles: 33, 100
  
  const isDark = theme === 'dark';

  const playSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Pleasant chime/bell sound (880Hz = A5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); 
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

        osc.start();
        osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
        console.error("Audio playback failed", e);
    }
  };

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    if (navigator.vibrate) navigator.vibrate(40);
    
    // Auto reset cycle visual feedback + Sound
    if (target !== 999999 && newCount > 0 && newCount % target === 0) {
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
        playSound();
    }
  };

  const reset = () => {
      setCount(0);
      if (navigator.vibrate) navigator.vibrate(20);
  };

  // Styles based on theme
  const containerStyle = isDark 
    ? 'bg-slate-900' 
    : 'bg-slate-50';
    
  const buttonGradient = isDark 
    ? 'from-slate-800 to-black border-amber-500/30 text-amber-500' 
    : 'from-white to-emerald-50 border-emerald-500/30 text-emerald-600';

  const ringColor = isDark ? '#d97706' : '#10b981'; // Amber vs Emerald
  const glowColor = isDark ? 'rgba(217, 119, 6, 0.4)' : 'rgba(16, 185, 129, 0.4)';

  return (
    <div className={`flex flex-col h-[calc(100vh-140px)] md:h-[80vh] w-full ${containerStyle} transition-colors`}>
      
      {/* Top Controls Toolbar */}
      <div className={`flex justify-between items-center p-4 rounded-2xl mb-4 ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-700'} shadow-sm border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
              <span className="text-sm font-bold opacity-70">الهدف:</span>
              <select 
                value={target} 
                onChange={(e) => setTarget(Number(e.target.value))}
                className={`py-1 px-3 rounded-lg text-sm font-bold outline-none cursor-pointer transition ${isDark ? 'bg-slate-700 text-amber-400' : 'bg-slate-100 text-emerald-600'}`}
              >
                  <option value={33}>33</option>
                  <option value={100}>100</option>
                  <option value={1000}>1000</option>
                  <option value={999999}>مفتوح</option>
              </select>
          </div>
          
           <button 
                onClick={reset} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition active:scale-95
                ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
           >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              تصفير
           </button>
      </div>

      {/* Center Display Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
          
          {/* Main Button */}
          <div className="relative group cursor-pointer touch-manipulation" onClick={increment} style={{ WebkitTapHighlightColor: 'transparent' }}>
            {/* Ambient Glow */}
            <div 
                className="absolute inset-0 rounded-full blur-[80px] opacity-30 group-active:opacity-50 transition-opacity duration-200"
                style={{ backgroundColor: isDark ? '#fbbf24' : '#34d399' }}
            ></div>
            
            {/* The Physical Button Circle */}
            <div 
                className={`relative w-[75vw] h-[75vw] max-w-[320px] max-h-[320px] rounded-full bg-gradient-to-br ${buttonGradient} shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center active:scale-[0.97] transition-all duration-100 border-[6px] md:border-[8px] z-10`}
                style={{ boxShadow: `0 15px 40px -10px ${glowColor}`}}
            >
                <div className={`absolute inset-4 rounded-full border opacity-10 ${isDark ? 'border-white' : 'border-slate-400'}`}></div>
                
                <span className="text-7xl md:text-8xl font-bold font-mono tracking-tighter drop-shadow-sm select-none">
                    {count}
                </span>
                
                <span className="mt-4 text-xs font-medium tracking-[0.2em] uppercase opacity-50">
                    اضغط
                </span>
                
                {/* Progress Ring */}
                <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90 pointer-events-none p-2">
                    <circle
                        cx="50%" cy="50%" r="48%"
                        fill="transparent"
                        stroke={ringColor}
                        strokeWidth="4"
                        strokeDasharray={2 * Math.PI * 135} 
                        strokeDashoffset={2 * Math.PI * 135 * (1 - ((count % target) / target))}
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-out"
                    />
                </svg>
            </div>
          </div>
          
          {/* Footer Info */}
          <div className={`mt-8 flex flex-col items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
             <div className="text-sm font-medium bg-black/5 px-4 py-1 rounded-full dark:bg-white/5">
                مجموع الدورات: <span className={isDark ? 'text-amber-500' : 'text-emerald-600'}>{Math.floor(count / target)}</span>
             </div>
          </div>
      </div>
    </div>
  );
};