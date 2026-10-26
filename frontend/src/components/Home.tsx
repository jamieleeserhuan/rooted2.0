/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { HelpCircle, ArrowRight, Languages, Sparkles, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';
import LiquidEther from './LiquidEther';
import FlowingMenu from './FlowingMenu';

interface HomeProps {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  onStart: () => void;
}

export default function Home({ currentLanguage, setLanguage, onStart }: HomeProps) {
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [rightsOpen, setRightsOpen] = useState(false);  const t = translations[currentLanguage];

  const categoryPills = [
    { label: t.healthcare, color: 'bg-[#EAF3EE] text-[#3B6651] border-[#C2DEC3]/50' },
    { label: t.engineering, color: 'bg-[#E8F1F5] text-[#34627C] border-[#CCE2F0]/50' },
    { label: t.education, color: 'bg-[#FAF4EB] text-[#865E26] border-[#F3E2C9]/50' },
    { label: t.law, color: 'bg-[#F3EFF9] text-[#5A3886] border-[#DDD1ED]/50' },
    { label: t.trades, color: 'bg-[#FBF1EA] text-[#8D4D20] border-[#F3DCB7]/50' },
  ];

  const pathwaysList = [
    { link: 'https://www.youtube.com/watch?v=OcDHKGsF0LQ', text: t.healthcare, image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400' },
    { link: 'https://www.youtube.com/watch?v=yxBC4iZHSmE', text: t.engineering, image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400' },
    { link: 'https://www.youtube.com/watch?v=c_1c6FU8VAY', text: t.education, image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400' },
    { link: 'https://www.youtube.com/watch?v=U4RzTN2gz1o', text: t.law, image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=400' }
  ];

  const isRtl = currentLanguage === 'ar' || currentLanguage === 'dr';

  return (
    <div className="relative flex flex-col items-center justify-between py-6 px-2 md:px-4 min-h-screen">
      {/* Absolute background interactive canvas */}
      <div className="absolute inset-0 z-0 overflow-hidden" id="ambient-liquid-container" style={{ pointerEvents: 'auto' }}>
        <LiquidEther
          colors={['#233e00', '#A08E79', '#C2DEC3', '#E1DBD2']}
          mouseForce={15}
          cursorSize={80}
          resolution={0.4}
          autoDemo={true}
          autoSpeed={0.4}
        />
      </div>

      {/* Absolute Language Switcher Top Right */}
      <div className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} z-10 flex items-center gap-2 bg-[#E9E5DE]/90 backdrop-blur-xs hover:bg-[#DED9D2] transition px-4 py-2 rounded-full text-stone-700 text-sm font-medium shadow-sm border border-[#E9E5DE]`}>
        <Languages className="w-4 h-4 text-[#2A2A28]" />
        <select
          value={currentLanguage}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-transparent border-none outline-none font-semibold cursor-pointer py-0.5 text-xs md:text-sm text-[#343432]"
          aria-label="Select Language"
        >
          <option value="en" className="bg-white">English (EN)</option>
          <option value="fr" className="bg-white">Français (FR)</option>
          <option value="ar" className="bg-white">العربية (AR)</option>
          <option value="dr" className="bg-white">دری (DR)</option>
        </select>
      </div>

      {/* Main Branding Card */}
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-md border border-[#E9E5DE]/80 rounded-[40px] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(35,62,0,0.1)] mt-16 flex flex-col items-center text-center z-10">
      
        {/* Logo Icon */}
        <div className="mb-6">
          <img src="/rooted-logo.png" alt="Rooted logo" className="h-48 w-48 rounded-full object-cover" />
        </div>
        <p className="text-xl md:text-2xl font-serif text-[#2D4A2D] italic tracking-wide mb-6">            {t.tagline}
        </p>

         {/* Categories Section */}
        <div className="w-full mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categoryPills.map((pill, index) => (
              <span
                key={index}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border ${pill.color} transition-all duration-300 hover:scale-105`}
              >
                {pill.label}
              </span>
            ))}
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-transparent bg-[#F7F5F0] text-[#2A2A28] italic">
              + 400 more
            </span>
          </div>
        </div>
        
        <p className="text-[#2A2A28] leading-relaxed text-sm md:text-base max-w-lg mb-4">
          {t.briefExplanation}
        </p>
      
        {/* Primary and Secondary CTA Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-4 justify-center">
          <button
            id="start-button"
            onClick={onStart}
            className="flex items-center justify-center gap-2.5 px-8 py-4.5 bg-[#233e00] hover:bg-[#192d00] text-white font-bold rounded-[20px] transition shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] min-h-[48px] cursor-pointer w-full sm:w-auto"
          >
            <span>{t.startCTA}</span>
            <ArrowRight className="w-5 h-5 opacity-80" />
          </button>

          <button
            id="how-works-button"
            onClick={() => setShowHowItWorksModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-4.5 border border-transparent hover:border-[#DED9D2] text-[#2A2A28] bg-[#F7F5F0] hover:bg-[#E9E5DE] font-semibold rounded-[20px] transition duration-150 active:scale-[0.98] min-h-[48px] cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#2A2A28]" />
            <span>{t.howItWorksCTA}</span>
          </button>
        </div>

        {/* Disclaimer + Rights cards */}
        <div className="w-full flex flex-col gap-3 mt-6">
          <button
            onClick={() => setDisclaimerOpen(o => !o)}
            className="w-full bg-[#F1EDEA] border border-[#E9E5DE] rounded-2xl p-4 text-left flex gap-3 items-center cursor-pointer hover:bg-[#E9E5DE] transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#2A2A28] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <h4 className="text-xs font-bold text-[#2A2A28] uppercase tracking-wider flex-1">{t.disclaimerTitle}</h4>
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-[#2A2A28] transition-transform ${disclaimerOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {disclaimerOpen && (
            <div className="bg-[#F1EDEA] border border-[#E9E5DE] rounded-2xl px-4 pb-4 pt-2 text-left -mt-2">
              <p className="text-xs text-[#2A2A28] leading-relaxed">{t.disclaimerText}</p>
            </div>
          )}
          <button
            onClick={() => setRightsOpen(o => !o)}
            className="w-full bg-[#EAF3EE] border border-[#C2DEC3]/40 rounded-2xl p-4 text-left flex gap-3 items-center cursor-pointer hover:bg-[#d8ece0] transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#233e00] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <h4 className="text-xs font-bold text-[#2A2A28] uppercase tracking-wider flex-1">{t.knowYourRightsTitle}</h4>
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-[#2A2A28] transition-transform ${rightsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {rightsOpen && (
            <div className="bg-[#EAF3EE] border border-[#C2DEC3]/40 rounded-2xl px-4 pb-4 pt-2 text-left -mt-2">
              <p className="text-xs text-[#3A6B50] leading-relaxed">{t.rightsText}</p>
            </div>
          )}
        </div>
      </div>
      {/* Flowing Menu Section */}
      <div className="w-full max-w-2xl mt-8 mb-4 overflow-hidden rounded-[32px] border border-[#E9E5DE] bg-white/90 backdrop-blur-md shadow-xs z-10" id="interactive-pathway-carousel">
        <div className="p-4 bg-[#F7F5F0]/80 border-b border-[#E9E5DE] text-center select-none">
          <h3 className="text-xs font-bold text-[#233e00] uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#2A2A28]" /> Stories From the Community
          </h3>
        </div>
        <div style={{ height: '180px', position: 'relative' }}>
          <FlowingMenu 
            items={pathwaysList} 
            textColor="#233e00"
            bgColor="transparent"
            marqueeBgColor="#233e00"
            marqueeTextColor="#ffffff"
            borderColor="#E9E5DE"
            speed={16}
          />
        </div>
      </div>

      {/* Multilingual How it Works Modal */}
      {showHowItWorksModal && (
        <div className="fixed inset-0 bg-[#343432]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[32px] border border-[#E9E5DE] p-6 md:p-8 max-w-xl w-full shadow-2xl relative">
            <h2 className="text-xl md:text-2xl font-bold font-serif text-[#2A2A28] mb-4 flex items-center gap-2 border-b border-[#F1EDEA] pb-3">
              <Sparkles className="w-5 h-5 text-[#233e00]" />
              <span>{t.howItWorksTitle}</span>
            </h2>
            
            <div className="space-y-4 mb-6 text-[#2A2A28] text-sm leading-relaxed text-left">
              <p>{t.howItWorksText1}</p>
              <p>{t.howItWorksText2}</p>
              <p>{t.howItWorksText3}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowHowItWorksModal(false)}
                className="px-6 py-2.5 bg-[#233e00] hover:bg-[#192d00] text-white rounded-xl font-bold text-sm transition cursor-pointer"
              >
                {t.closeCTA}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}