import React from 'react';

export enum Category {
  MORNING = 'Sabah',
  EVENING = 'Masa',
  SLEEP = 'Sleep',
  PRAYER = 'Prayer',
  WAKEUP = 'Wakeup',
  MOSQUE = 'Mosque',
  HOME = 'Home',
  FOOD = 'Food',
  TRAVEL = 'Travel',
  DAILY = 'Daily' // Bathroom, Dressing, Wudu, etc.
}

export type Theme = 'light' | 'dark';

export interface Dhikr {
  id: number;
  text: string;
  count: number; // Target count
  virtue?: string; // Fadl/Benefit
  category: Category;
  reference?: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
    number: number;
    text: string;
    numberInSurah: number;
    juz: number;
    manzil: number;
    page: number;
    ruku: number;
    hizbQuarter: number;
    sajda: boolean;
}

export interface SearchResult {
    surah: {
        number: number;
        name: string;
        englishName: string;
    };
    number: number; // Ayah global number
    numberInSurah: number;
    text: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}