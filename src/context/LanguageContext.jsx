import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    main: "Main",
    farming: "Farming",
    services: "Services",
    account: "Account",
    dashboard: "Dashboard",
    ai_assistant: "AI Assistant",
    my_lands: "My Lands",
    disease_detection: "Disease Detection",
    soil_analysis: "Soil Analysis",
    weather_forecast: "Weather Forecast",
    marketplace: "Marketplace",
    orders: "My Orders",
    profit_calculator: "Profit Calculator",
    my_crop_tracks: "My Crop Tracks",
    expert_consultation: "Expert Consultation",
    plans_billing: "Plans & Billing",
    profile: "Profile",
    welcome: "Welcome back",
  },
  bn: {
    main: "প্রধান",
    farming: "কৃষি",
    services: "সেবা",
    account: "অ্যাকাউন্ট",
    dashboard: "ড্যাশবোর্ড",
    ai_assistant: "এআই সহকারী",
    my_lands: "আমার জমি",
    disease_detection: "রোগ শনাক্তকরণ",
    soil_analysis: "মাটি বিশ্লেষণ",
    weather_forecast: "আবহাওয়ার পূর্বাভাস",
    marketplace: "বাজার",
    orders: "আমার অর্ডার",
    profit_calculator: "লাভ পরিমাপক",
    my_crop_tracks: "শস্য ট্র্যাক",
    expert_consultation: "বিশেষজ্ঞ পরামর্শ",
    plans_billing: "পরিকল্পনা ও বিলিং",
    profile: "প্রোফাইল",
    welcome: "আবার স্বাগতম",
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('sofol_lang') || 'en');

  const t = (key) => {
    if (!translations[lang]) return key;
    return translations[lang][key] || key;
  };
  
  const toggleLang = () => {
    setLang(prev => {
      const next = prev === 'en' ? 'bn' : 'en';
      localStorage.setItem('sofol_lang', next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
