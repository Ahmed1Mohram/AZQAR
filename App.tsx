import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { AdhkarView } from './components/AdhkarView';
import { TasbeehView } from './components/TasbeehView';
import { QuranView } from './components/QuranView';
import { Theme } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('adhkar');
  const [theme, setTheme] = useState<Theme>('light');

  const renderContent = () => {
    switch (activeTab) {
      case 'adhkar':
        return <AdhkarView onThemeChange={setTheme} currentTheme={theme} />;
      case 'tasbeeh':
        return <TasbeehView theme={theme} />;
      case 'quran':
        return <QuranView theme={theme} />;
      default:
        return <AdhkarView onThemeChange={setTheme} currentTheme={theme} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} theme={theme}>
      <div className="animate-fade-in">
        {renderContent()}
      </div>
    </Layout>
  );
}

export default App;