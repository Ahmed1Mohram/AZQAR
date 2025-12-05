import React from 'react';
import { NavItem, Theme } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (id: string) => void;
  theme: Theme;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, theme }) => {
  const isDark = theme === 'dark';

  const navItems: NavItem[] = [
    { id: 'adhkar', label: 'الأذكار', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    )},
    { id: 'tasbeeh', label: 'المسبحة', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { id: 'quran', label: 'القرآن', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    )}
  ];

  const bgColor = isDark ? 'bg-slate-900' : 'bg-slate-50';
  const textColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const headerBg = isDark ? 'bg-slate-800' : 'bg-emerald-700';
  // Added border colors to navBg for better separation
  const navBg = isDark ? 'bg-slate-800 border-t border-slate-700' : 'bg-white border-t border-slate-200';

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} flex flex-col transition-colors duration-500`}>
      {/* Header */}
      <header className={`${headerBg} text-white p-4 shadow-lg sticky top-0 z-40 transition-colors duration-500`}>
        <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-6">
                <h1 className="text-2xl font-bold font-amiri text-amber-300">نور المسلم</h1>
                
                {/* Desktop Navigation (Visible on large screens) */}
                <div className="hidden lg:flex gap-1">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`px-4 py-2 rounded-lg transition-all font-bold text-sm flex items-center gap-2 ${
                                activeTab === item.id 
                                ? 'bg-white/20 text-white shadow-sm' 
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <span className="w-5 h-5">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="text-sm opacity-90 flex items-center gap-2 font-mono">
                {isDark ? '🌙 المساء' : '☀️ الصباح'}
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 pb-28 lg:pb-8 overflow-y-auto flex flex-col">
        <div className="flex-1">
            {children}
        </div>
        
        {/* Creator Credit */}
        <footer className={`mt-8 pb-4 text-center font-amiri text-sm opacity-60 flex flex-col items-center justify-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>تم التطوير بواسطة</span>
            <span className={`font-bold text-base ${isDark ? 'text-amber-500' : 'text-emerald-600'}`}>أحمد محرم</span>
        </footer>
      </main>

      {/* Bottom Navigation (Mobile First) */}
      {/* Changed md:hidden to lg:hidden to show on larger tablets/phones */}
      {/* Increased Z-index to z-[100] to ensure it is always on top */}
      <nav className={`fixed bottom-0 left-0 right-0 ${navBg} shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] lg:hidden z-[100] transition-colors duration-500 pb-2 pt-2`}>
        <div className="flex justify-around px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 flex-1 active:scale-95 ${
                activeTab === item.id 
                    ? (isDark ? 'text-amber-400 bg-slate-700/50' : 'text-emerald-600 bg-emerald-50') 
                    : (isDark ? 'text-slate-400' : 'text-slate-500')
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1 font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};