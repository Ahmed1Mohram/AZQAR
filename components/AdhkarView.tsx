import React, { useState, useMemo, useEffect } from 'react';
import { ADHKAR_DATA, CATEGORY_LABELS } from '../constants';
import { Category, Theme } from '../types';
import { AdhkarCard } from './AdhkarCard';

interface AdhkarViewProps {
    onThemeChange: (theme: Theme) => void;
    currentTheme: Theme;
}

export const AdhkarView: React.FC<AdhkarViewProps> = ({ onThemeChange, currentTheme }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.MORNING);
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  // Effect to change theme based on category
  useEffect(() => {
    if (selectedCategory === Category.EVENING) {
        onThemeChange('dark');
    } else if (selectedCategory === Category.MORNING) {
        onThemeChange('light');
    }
    // For other categories, we might keep the current theme or default to light
  }, [selectedCategory, onThemeChange]);

  // Filter adhkar
  const activeAdhkar = useMemo(() => {
    return ADHKAR_DATA.filter(d => d.category === selectedCategory);
  }, [selectedCategory]);

  const progress = activeAdhkar.length > 0 
    ? (completedIds.filter(id => activeAdhkar.find(a => a.id === id)).length / activeAdhkar.length) * 100
    : 0;

  const handleComplete = (id: number) => {
    if (!completedIds.includes(id)) {
      setCompletedIds(prev => [...prev, id]);
    }
  };

  const isDark = currentTheme === 'dark';

  return (
    <div className="space-y-6 pb-6">
      {/* Sticky Category Filter */}
      <div className={`sticky top-0 z-30 pt-2 pb-4 -mx-4 px-4 transition-colors duration-300 ${isDark ? 'bg-slate-900/95 shadow-slate-900/50' : 'bg-slate-50/95 shadow-slate-200/50'} backdrop-blur-sm border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex overflow-x-auto gap-2 no-scrollbar snap-x py-1">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
                key={key}
                onClick={() => {
                    setSelectedCategory(key as Category);
                    setCompletedIds([]); // Reset for demo purposes when switching
                }}
                className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold shadow-sm transition-all snap-start border flex-shrink-0
                ${selectedCategory === key 
                    ? (isDark ? 'bg-amber-600 text-white border-amber-600 scale-105' : 'bg-emerald-600 text-white border-emerald-600 scale-105') 
                    : (isDark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')
                }`}
            >
                {label}
            </button>
            ))}
        </div>
        
        {/* Compact Progress Bar inside sticky header for visibility */}
        <div className="mt-3 flex items-center gap-3">
             <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden dark:bg-slate-700">
                 <div 
                    className={`h-full transition-all duration-500 ${isDark ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${progress}%` }}
                 ></div>
             </div>
             <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                 {Math.round(progress)}%
             </span>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeAdhkar.map((dhikr) => (
          <AdhkarCard 
            key={dhikr.id} 
            dhikr={dhikr} 
            onComplete={() => handleComplete(dhikr.id)}
            theme={currentTheme}
          />
        ))}
        {activeAdhkar.length === 0 && (
           <div className="col-span-full text-center py-10 text-slate-400">
             لا توجد أذكار في هذا القسم حالياً
           </div>
        )}
      </div>

      {progress === 100 && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
              <div className={`${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform scale-100 animate-bounce-in`}>
                  <div className={`w-20 h-20 ${isDark ? 'bg-slate-700' : 'bg-emerald-100'} rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner`}>
                      <span className="text-4xl">🎉</span>
                  </div>
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-amber-400' : 'text-emerald-800'} mb-2`}>تقبل الله طاعتكم</h3>
                  <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} mb-6`}>لقد أتممت {CATEGORY_LABELS[selectedCategory]} بنجاح.</p>
                  <button 
                    onClick={() => setCompletedIds([])} 
                    className={`w-full ${isDark ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white py-3.5 rounded-xl font-bold transition shadow-lg active:scale-95`}
                  >
                      إغلاق
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};