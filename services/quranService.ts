import { Surah, SearchResult } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

export interface Reciter {
    id: string;
    name: string;
    url: string;
}

export const POPULAR_RECITERS: Reciter[] = [
    { id: 'alafasy', name: 'مشاري العفاسي', url: 'https://server8.mp3quran.net/afs/' },
    { id: 'sudais', name: 'عبدالرحمن السديس', url: 'https://server11.mp3quran.net/sds/' },
    { id: 'shuraim', name: 'سعود الشريم', url: 'https://server7.mp3quran.net/shur/' },
    { id: 'maher', name: 'ماهر المعيقلي', url: 'https://server12.mp3quran.net/maher/' },
    { id: 'ghamdi', name: 'سعد الغامدي', url: 'https://server7.mp3quran.net/s_gmd/' },
    { id: 'ajmy', name: 'أحمد العجمي', url: 'https://server10.mp3quran.net/ajm/' },
    { id: 'hussary', name: 'محمود خليل الحصري', url: 'https://server13.mp3quran.net/husr/' },
    { id: 'abdulbasit', name: 'عبدالباسط عبدالصمد (مرتل)', url: 'https://server7.mp3quran.net/basit/' },
    { id: 'minshawi', name: 'محمد صديق المنشاوي', url: 'https://server10.mp3quran.net/minsh/' },
    { id: 'dosari', name: 'ياسر الدوسري', url: 'https://server11.mp3quran.net/yasser/' },
    { id: 'banna', name: 'محمود علي البنا', url: 'https://server8.mp3quran.net/bna/' },
    { id: 'juhany', name: 'عبدالله الجهني', url: 'https://server13.mp3quran.net/jhn/' },
];

export const getSurahs = async (): Promise<Surah[]> => {
  try {
    const response = await fetch(`${BASE_URL}/surah`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to fetch surahs", error);
    return [];
  }
};

// Returns both Arabic text and Tafsir (Al-Muyassar)
export const getSurahDetails = async (number: number): Promise<any> => {
    try {
        // Fetch Arabic Text (Uthmani for reading)
        const textResponse = await fetch(`${BASE_URL}/surah/${number}/quran-uthmani`);
        const textData = await textResponse.json();

        // Fetch Tafsir (ar.muyassar is standard easy tafsir)
        const tafsirResponse = await fetch(`${BASE_URL}/surah/${number}/ar.muyassar`);
        const tafsirData = await tafsirResponse.json();

        if (textData.code === 200 && tafsirData.code === 200) {
            // Merge tafsir into the ayahs
            const ayahs = textData.data.ayahs.map((ayah: any, index: number) => ({
                ...ayah,
                tafsir: tafsirData.data.ayahs[index]?.text || "لا يوجد تفسير"
            }));
            return { ...textData.data, ayahs };
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch surah details", error);
        return null;
    }
}

// Search for text within Ayahs
export const searchQuran = async (query: string): Promise<SearchResult[]> => {
    if (!query || query.length < 2) return [];
    try {
        const response = await fetch(`${BASE_URL}/search/${encodeURIComponent(query)}/all/ar`);
        const data = await response.json();
        
        if (data.code === 200 && data.data && data.data.matches) {
            return data.data.matches.map((match: any) => ({
                surah: match.surah,
                number: match.number,
                numberInSurah: match.numberInSurah,
                text: match.text
            }));
        }
        return [];
    } catch (error) {
        console.error("Search failed", error);
        return [];
    }
}

// Get Audio URL based on Reciter
export const getAudioUrl = (surahNumber: number, reciterUrl: string = POPULAR_RECITERS[0].url): string => {
  const paddedNumber = surahNumber.toString().padStart(3, '0');
  return `${reciterUrl}${paddedNumber}.mp3`;
};