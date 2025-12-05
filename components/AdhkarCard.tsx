import React, { useState } from 'react';
import { Dhikr, Theme } from '../types';
import { explainDhikr } from '../services/geminiService';

interface AdhkarCardProps {
  dhikr: Dhikr;
  onComplete: () => void;
  theme: Theme;
}

export const AdhkarCard: React.FC<AdhkarCardProps> = ({ dhikr, onComplete, theme }) => {
  const [count, setCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const isDark = theme === 'dark';

  // Vibrate on click if supported
  const handlePress = () => {
    if (isCompleted) return;

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    const nextCount = count + 1;
    setCount(nextCount);

    if (nextCount >= dhikr.count) {
      setIsCompleted(true);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]); // Success pattern
      }
      setTimeout(onComplete, 500); // Slight delay before callback
    }
  };

  const handleExplain = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (aiExplanation) {
        setAiExplanation(null); // Toggle off
        return;
    }
    setLoadingAi(true);
    const text = await explainDhikr(dhikr.text);
    setAiExplanation(text);
    setLoadingAi(false);
  };

  const progress = (count / dhikr.count) * 100;
  // Circumference for SVG circle
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Theme Styles
  const cardBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';
  const completedStyle = isDark 
    ? 'bg-slate-700 border-amber-900/30 opacity-60' 
    : 'bg-emerald-50 border-emerald-200 opacity-80';
  
  const textColor = isDark ? 'text-slate-200' : 'text-slate-800';
  const circleTrack = isDark ? 'text-slate-700' : 'text-slate-100';
  const circleProgress = isDark 
    ? (isCompleted ? 'text-amber-500' : 'text-amber-500') 
    : (isCompleted ? 'text-emerald-400' : 'text-emerald-500');
  
  const countText = isDark 
    ? (isCompleted ? 'text-amber-400' : 'text-slate-300')
    : (isCompleted ? 'text-emerald-600' : 'text-slate-700');

  return (
    <div 
      onClick={handlePress}
      className={`relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 cursor-pointer select-none
        ${cardBg}
        ${isCompleted ? completedStyle + ' transform scale-[0.98]' : 'hover:shadow-xl hover:-translate-y-1 active:scale-[0.99]'}
      `}
    >
      <div className="p-6 flex flex-col items-center text-center space-y-4">
        
        {/* Progress Counter Circle */}
        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="48" cy="48" r={radius}
                    stroke="currentColor" strokeWidth="6" fill="transparent"
                    className={circleTrack}
                />
                {/* Progress Circle */}
                <circle
                    cx="48" cy="48" r={radius}
                    stroke="currentColor" strokeWidth="6" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-300 ${circleProgress}`}
                />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col">
                <span className={`text-2xl font-bold ${countText}`}>
                    {count}/{dhikr.count}
                </span>
            </div>
        </div>

        {/* Text */}
        <p className={`font-amiri text-xl md:text-2xl leading-loose ${textColor} dir-rtl w-full`}>
          {dhikr.text}
        </p>

        {/* Footer: Virtue & AI */}
        <div className="w-full flex flex-col gap-2 mt-auto">
            {dhikr.virtue && (
            <div className={`mt-2 p-3 rounded-lg text-sm w-full font-medium ${isDark ? 'bg-slate-700 text-amber-200' : 'bg-amber-50 text-amber-800'}`}>
                <span className="font-bold ml-1">الفضل:</span> {dhikr.virtue}
            </div>
            )}
            
            <button 
                onClick={handleExplain}
                className={`self-center text-xs font-semibold hover:underline mt-2 flex items-center gap-1 z-10 ${isDark ? 'text-amber-400' : 'text-emerald-600'}`}
            >
                {loadingAi ? 'جاري التحليل...' : aiExplanation ? 'إخفاء الشرح' : '✨ شرح الذكر (AI)'}
            </button>

            {aiExplanation && (
                <div className={`mt-2 p-3 rounded-lg text-sm text-right leading-relaxed animate-fade-in ${isDark ? 'bg-slate-900 border border-slate-600 text-slate-300' : 'bg-indigo-50 border border-indigo-100 text-indigo-900'}`}>
                    {aiExplanation}
                </div>
            )}
        </div>
      </div>
      
      {/* Ripple/Overlay for feedback */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${isDark ? 'bg-amber-500' : 'bg-emerald-500'} opacity-0 ${isCompleted ? 'opacity-5' : ''}`} />
    </div>
  );
};