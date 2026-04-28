import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'it' | 'en' | 'es' | 'de' | 'fr';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (obj: any, field: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('tpc_lang');
    return (saved as Language) || 'it';
  });

  useEffect(() => {
    localStorage.setItem('tpc_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (obj: any, field: string) => {
    if (!obj) return '';
    const localizedField = `${field}_${lang}`;
    return obj[localizedField] || obj[`${field}_it`] || obj[field] || '';
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
