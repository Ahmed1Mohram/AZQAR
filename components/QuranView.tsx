import React, { useState, useEffect, useRef } from 'react';
import { getSurahs, getAudioUrl, getSurahDetails, searchQuran, POPULAR_RECITERS, Reciter } from '../services/quranService';
import { Surah, Theme, SearchResult } from '../types';

interface QuranViewProps {
    theme: Theme;
}

export const QuranView: React.FC<QuranViewProps> = ({ theme }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [search, setSearch] = useState('');
  const [isSearchingAyahs, setIsSearchingAyahs] = useState(false);
  
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [readingMode, setReadingMode] = useState(false);
  const [surahData, setSurahData] = useState<any>(null);
  const [showTafsir, setShowTafsir] = useState(false);

  // Reciter & Selection Logic
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(POPULAR_RECITERS[0]);
  const [tempSelectedSurah, setTempSelectedSurah] = useState<Surah | null>(null);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showReciterModal, setShowReciterModal] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchIt = async () => {
      const data = await getSurahs();
      setSurahs(data);
      setFilteredSurahs(data);
      setIsLoading(false);
    };
    fetchIt();
  }, []);

  // Filter Surah names locally
  useEffect(() => {
    if (search.length === 0) {
        setSearchResults([]);
        setIsSearchingAyahs(false);
    }
    
    const filtered = surahs.filter(s => 
      s.name.includes(search) || 
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      s.number.toString() === search
    );
    setFilteredSurahs(filtered);
  }, [search, surahs]);

  useEffect(() => {
    if (currentSurah && audioRef.current && !readingMode) {
      audioRef.current.src = getAudioUrl(currentSurah.number, selectedReciter.url);
      if(isPlaying) audioRef.current.play();
    }
  }, [currentSurah, selectedReciter, readingMode]);

  const togglePlay = () => {
    if (!audioRef.current || !currentSurah) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onSurahClick = (surah: Surah) => {
      setTempSelectedSurah(surah);
      setShowOptionModal(true);
  };

  const handleStartReading = async () => {
    if(!tempSelectedSurah) return;
    setShowOptionModal(false);
    
    setCurrentSurah(tempSelectedSurah);
    setReadingMode(true);
    setIsPlaying(false);
    
    // Fetch data immediately
    const data = await getSurahDetails(tempSelectedSurah.number);
    setSurahData(data);
  };

  const handleStartListeningOptions = () => {
      setShowOptionModal(false);
      setShowReciterModal(true);
  };

  const handleReciterSelect = (reciter: Reciter) => {
      setSelectedReciter(reciter);
      setShowReciterModal(false);
      
      if(tempSelectedSurah) {
          setCurrentSurah(tempSelectedSurah);
          setReadingMode(false);
          setIsPlaying(true);
          setSurahData(null);
          setShowTafsir(false);
          // Audio will auto-play due to useEffect
      }
  };

  // Direct reading from search results
  const handleDirectRead = async (surah: Surah) => {
    setCurrentSurah(surah);
    setReadingMode(true);
    setIsPlaying(false);
    const data = await getSurahDetails(surah.number);
    setSurahData(data);
  };

  const handleDeepSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!search.trim()) return;
      
      setIsSearchingAyahs(true);
      const results = await searchQuran(search);
      setSearchResults(results);
      setIsSearchingAyahs(false);
  };

  const toggleReadingMode = async () => {
      if(!currentSurah) return;
      if (!readingMode && !surahData) {
          // Fetch text with Tafsir
          const data = await getSurahDetails(currentSurah.number);
          setSurahData(data);
      }
      setReadingMode(!readingMode);
  };

  const closeReadingMode = () => {
      setReadingMode(false);
  };

  const handleDownload = (e: React.MouseEvent) => {
      e.stopPropagation();
      if(!currentSurah) return;
      const url = getAudioUrl(currentSurah.number, selectedReciter.url);
      window.open(url, '_blank');
  };

  if (isLoading) {
      return <div className={`flex items-center justify-center h-64 ${isDark ? 'text-amber-400' : 'text-emerald-600'}`}>جاري تحميل المصحف الشريف...</div>;
  }

  return (
    <div className="space-y-4 pb-28 relative">
      
      {/* Search Bar - Hidden in reading mode to focus */}
      {!readingMode && (
          <form onSubmit={handleDeepSearch} className="relative z-10">
            <input
              type="text"
              placeholder="ابحث عن سورة أو كلمة داخل آية..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full p-4 rounded-xl border shadow-sm outline-none pl-12 font-amiri transition-colors text-lg
                ${isDark 
                    ? 'bg-slate-800 border-slate-700 text-white focus:ring-2 focus:ring-amber-500 placeholder-slate-500' 
                    : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500 placeholder-slate-400'
                }`}
            />
            <button 
                type="submit"
                className={`absolute left-2 top-2 bottom-2 px-4 rounded-lg flex items-center justify-center transition
                ${isDark ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
            >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
          </form>
      )}

      {/* Deep Search Results (Ayahs) */}
      {searchResults.length > 0 && !readingMode && (
          <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                  <h3 className={`font-bold ${isDark ? 'text-amber-400' : 'text-emerald-700'}`}>نتائج البحث في الآيات ({searchResults.length})</h3>
                  <button onClick={() => { setSearchResults([]); setSearch(''); }} className="text-xs text-red-500 font-bold p-2">مسح البحث</button>
              </div>
              {searchResults.map((result, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleDirectRead(result.surah as Surah)}
                    className={`p-4 rounded-xl border cursor-pointer transition active:scale-[0.98] ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-100 hover:bg-emerald-50'}`}
                  >
                      <p className={`font-amiri text-lg mb-2 leading-loose ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{result.text}</p>
                      <div className={`text-xs flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span>سورة {result.surah.name}</span>
                          <span>آية {result.numberInSurah}</span>
                      </div>
                  </div>
              ))}
              <hr className={`my-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />
          </div>
      )}

      {/* Detail View (Reading Mode) */}
      {readingMode && currentSurah && (
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-xl shadow-lg border animate-fade-in overflow-hidden`}>
              {/* Sticky Header for Mobile */}
              <div className={`sticky top-0 z-30 flex justify-between items-center p-3 border-b gap-2 backdrop-blur-xl bg-opacity-95 ${isDark ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-slate-100'}`}>
                  
                  {/* Back Button / Index Button */}
                   <button 
                      onClick={closeReadingMode}
                      className={`flex items-center gap-1 pl-3 pr-2 py-2.5 rounded-lg transition text-sm font-bold shadow-sm
                      ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'}`}
                   >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                      الفهرس
                   </button>

                  <h2 className={`font-amiri text-xl md:text-3xl font-bold truncate ${isDark ? 'text-amber-400' : 'text-emerald-800'}`}>{currentSurah.name}</h2>
                  
                  {/* Tafsir Toggle */}
                   <button 
                      onClick={() => setShowTafsir(!showTafsir)}
                      className={`text-xs font-bold px-3 py-2.5 rounded-lg border transition
                      ${showTafsir 
                        ? (isDark ? 'bg-amber-600 text-white border-amber-600' : 'bg-emerald-600 text-white border-emerald-600') 
                        : (isDark ? 'border-slate-600 text-slate-400 hover:border-amber-500 hover:text-amber-500' : 'border-slate-300 text-slate-600 hover:border-emerald-500 hover:text-emerald-600')}`}
                   >
                       {showTafsir ? 'إخفاء' : 'التفسير'}
                   </button>
              </div>
              
              <div className={`p-4 md:p-8 max-h-[75vh] overflow-y-auto space-y-8 text-center leading-[2.8] font-amiri text-2xl md:text-3xl dir-rtl ${isDark ? 'text-slate-200' : 'text-slate-800'} scroll-smooth`}>
                  {surahData ? (
                      <>
                        {currentSurah.number !== 1 && currentSurah.number !== 9 && <div className={`mb-6 text-xl md:text-2xl ${isDark ? 'text-amber-500' : 'text-emerald-600'}`}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>}
                        {surahData.ayahs.map((ayah: any) => (
                            <div key={ayah.number} className="relative group">
                                <span className={`inline leading-[2.8] md:leading-[3.5]`}>
                                    {ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '')} 
                                    <span className={`text-xl inline-block mx-2 font-mono ${isDark ? 'text-amber-500' : 'text-emerald-500'}`}>۝{ayah.numberInSurah}</span>
                                </span>
                                {showTafsir && (
                                    <div className={`block text-lg mt-4 mb-8 p-4 rounded-xl text-right leading-relaxed shadow-sm ${isDark ? 'bg-slate-900/50 text-slate-300 border border-slate-700' : 'bg-emerald-50/50 text-slate-700 border border-emerald-100'}`}>
                                        <span className={`block text-sm font-bold mb-2 ${isDark ? 'text-amber-500' : 'text-emerald-600'}`}>التفسير الميسر:</span>
                                        {ayah.tafsir}
                                    </div>
                                )}
                            </div>
                        ))}
                      </>
                  ) : (
                      <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
                          <div className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin ${isDark ? 'border-amber-500' : 'border-emerald-500'}`}></div>
                          جاري تحميل الآيات والتفسير...
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* List */}
      {!readingMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSurahs.map((surah) => (
            <button
                key={surah.number}
                onClick={() => onSurahClick(surah)}
                className={`p-4 rounded-xl flex items-center justify-between transition-all duration-200 border active:scale-[0.99]
                ${currentSurah?.number === surah.number 
                    ? (isDark ? 'bg-slate-700 border-amber-500 ring-1 ring-amber-500' : 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500')
                    : (isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-100 hover:border-emerald-200 shadow-sm')
                }`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold font-mono text-lg shrink-0 ${isDark ? 'bg-slate-900 text-amber-500' : 'bg-emerald-100 text-emerald-700'}`}>
                        {surah.number}
                    </div>
                    <div className="text-right">
                        <div className={`font-amiri font-bold text-xl mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{surah.name}</div>
                        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{surah.englishName} • {surah.numberOfAyahs} آية</div>
                    </div>
                </div>
                <div className={`text-xs px-2.5 py-1.5 rounded-lg font-medium ${isDark ? 'text-slate-400 bg-slate-900' : 'text-slate-500 bg-slate-50'}`}>
                    {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                </div>
            </button>
            ))}
            {filteredSurahs.length === 0 && searchResults.length === 0 && !isSearchingAyahs && (
                 <div className="col-span-full text-center py-10 text-slate-400">
                    لم نجد سورة بهذا الاسم. اضغط على زر البحث للبحث في الآيات.
                 </div>
            )}
             {isSearchingAyahs && (
                 <div className="col-span-full text-center py-10 flex flex-col items-center gap-2 text-slate-400">
                    <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${isDark ? 'border-amber-500' : 'border-emerald-500'}`}></div>
                    جاري البحث في المصحف الشريف...
                 </div>
            )}
        </div>
      )}

      {/* Sticky Player with Download */}
      {currentSurah && !readingMode && (
        <div className={`fixed bottom-24 md:bottom-4 left-4 right-4 md:left-auto md:w-96 p-4 rounded-2xl shadow-2xl z-40 flex flex-col gap-2 backdrop-blur-md bg-opacity-95 border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-900 border-slate-800 text-white'}`}>
          <div className="flex justify-between items-center">
             <div className="flex-1 min-w-0 ml-4">
                <p className={`text-xs font-bold truncate ${isDark ? 'text-amber-400' : 'text-emerald-400'}`}>{selectedReciter.name}</p>
                <h3 className="font-amiri text-xl truncate">{currentSurah.name}</h3>
             </div>
             <div className="flex gap-2 shrink-0">
                 {/* Download Button */}
                 <button 
                    onClick={handleDownload}
                    className={`p-2 rounded-lg text-sm font-bold flex items-center justify-center transition ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-amber-500' : 'bg-white/10 hover:bg-white/20 text-emerald-400'}`}
                    title="تحميل"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3-3m0 0l-3 3m3-3v7.5" transform="rotate(180 12 12)" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v13.5m0 0l3-3m-3 3l-3-3" />
                    </svg>
                 </button>

                 <button 
                    onClick={toggleReadingMode}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition ${isDark ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                    title="القراءة"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    قراءة
                 </button>
             </div>
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
            <button 
                onClick={togglePlay}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition shadow-lg shrink-0 ${isDark ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-500 hover:bg-emerald-400'}`}
            >
                {isPlaying ? (
                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                ) : (
                     <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
            </button>
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                 <div className={`h-full w-full ${isPlaying ? 'animate-pulse' : ''} origin-left opacity-50 ${isDark ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
            </div>
          </div>
        </div>
      )}

      {/* Choice Modal (Read vs Listen) */}
      {showOptionModal && tempSelectedSurah && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowOptionModal(false)}>
              <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 transition-all ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`} onClick={e => e.stopPropagation()}>
                  <h3 className="text-2xl font-amiri font-bold text-center mb-8">سورة {tempSelectedSurah.name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={handleStartReading}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3 active:scale-95
                        ${isDark ? 'border-slate-600 hover:border-amber-500 hover:bg-slate-700' : 'border-slate-100 hover:border-emerald-500 hover:bg-emerald-50'}`}
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-12 h-12 ${isDark ? 'text-amber-500' : 'text-emerald-600'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                          </svg>
                          <span className="font-bold text-lg">قراءة</span>
                      </button>
                      <button 
                        onClick={handleStartListeningOptions}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3 active:scale-95
                        ${isDark ? 'border-slate-600 hover:border-amber-500 hover:bg-slate-700' : 'border-slate-100 hover:border-emerald-500 hover:bg-emerald-50'}`}
                      >
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-12 h-12 ${isDark ? 'text-amber-500' : 'text-emerald-600'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                           </svg>
                          <span className="font-bold text-lg">استماع</span>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Reciter Selection Modal */}
      {showReciterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowReciterModal(false)}>
              <div className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`} onClick={e => e.stopPropagation()}>
                  <div className={`p-4 border-b text-center font-bold text-lg ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                      اختر القارئ
                  </div>
                  <div className="overflow-y-auto p-2 space-y-1">
                      {POPULAR_RECITERS.map(reciter => (
                          <button
                            key={reciter.id}
                            onClick={() => handleReciterSelect(reciter)}
                            className={`w-full p-4 rounded-xl text-right font-medium transition flex items-center justify-between
                            ${selectedReciter.id === reciter.id 
                                ? (isDark ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white')
                                : (isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700')
                            }`}
                          >
                              <span>{reciter.name}</span>
                              {selectedReciter.id === reciter.id && (
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                  </svg>
                              )}
                          </button>
                      ))}
                  </div>
                  <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                      <button onClick={() => setShowReciterModal(false)} className="w-full py-3 rounded-xl font-bold opacity-70 hover:opacity-100 bg-gray-100 dark:bg-slate-700">إلغاء</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};