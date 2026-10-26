/**
 * App.tsx
 * -------
 * Top-level screen router. Manages which screen is shown and passes
 * data between screens. No fetch() calls here — those live in src/api/.
 */
import { useState, useEffect } from 'react';
import { AlertCircle, LifeBuoy } from 'lucide-react';
import type { Language, NocMatch, UserInput, Screen } from './types';
import { fetchNocMatches } from './api/match';
import Home from './components/Home';
import InputScreen from './components/InputScreen';
import MatchResults from './components/MatchResults';
import PathwayScreen from './components/PathwayScreen';
import SupportScreen from './components/SupportScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [detectedLanguage, setDetectedLanguage] = useState('auto');

  // Data passed between screens
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [matches, setMatches] = useState<NocMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<NocMatch | null>(null);

  // UI state
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matchError, setMatchError] = useState('');
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  const isRtl = currentLanguage === 'ar' || currentLanguage === 'dr';

  useEffect(() => {
    document.documentElement.setAttribute("data-fontsize", fontSize);
  }, [fontSize]);

  const handleDescriptionSubmit = async (input: UserInput) => {
    setIsLoadingMatches(true);
    setMatchError('');
    setUserInput(input);
    try {
      const data = await fetchNocMatches(input.description, currentLanguage);
      setMatches(data.matches);
      setDetectedLanguage(data.detectedLanguage || 'auto');
      setIsSandboxMode(!!data.fallbackMode);
      setScreen('results');
    } catch (error: any) {
      setMatchError(error.message || 'Could not find matching occupations. Please try again.');
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleSelectMatch = (match: NocMatch) => {
    setSelectedMatch(match);
    setScreen('pathway');
  };

  const handleReset = () => {
    setMatches([]);
    setSelectedMatch(null);
    setMatchError('');
    setScreen('input');
  };

  return (
    <div
      className="min-h-screen bg-[#F7F5F0] text-[#343432] antialiased py-6 px-4 md:px-8 flex flex-col justify-between"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between border-b border-[#E9E5DE] pb-5 mb-5">
        <button
          onClick={() => setScreen('home')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <img src="/rooted-logo.png" alt="Rooted logo" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-serif font-bold text-2xl tracking-tight text-[#2D4A2D]">Rooted</span>

        </button>

        <div className="flex items-center gap-3">
          {import.meta.env.VITE_USE_MOCK === 'true' && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              Mock mode
            </span>
          )}

          {/* Font size accessibility toggle */}
          <div className="flex items-center gap-0.5 bg-[#F1EDEA] border border-[#E9E5DE] rounded-xl px-1.5 py-1">
            {(['normal', 'large', 'xlarge'] as const).map((size, i) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                title={size === 'normal' ? 'Normal text' : size === 'large' ? 'Large text' : 'Extra large text'}
                className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                  i === 0 ? 'text-xs' : i === 1 ? 'text-sm' : 'text-base'
                } ${
                  fontSize === size
                    ? 'bg-[#5A7D6C] text-white'
                    : 'text-[#A08E79] hover:text-[#2A2A28]'
                }`}
              >
                A
              </button>
            ))}
          </div>
            <a
          
            href="https://github.com/jamieleeserhuan/rooted"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#A08E79] hover:text-[#5A7D6C] transition p-1"
          >
            <LifeBuoy className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center py-6">

        {/* Error banner */}
        {matchError && (
          <div className="w-full max-w-2xl mx-auto mb-6 p-5 border border-red-200 bg-red-50 text-red-800 rounded-2xl text-sm font-semibold flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div>
              <p>{matchError}</p>
              <button
                onClick={() => setMatchError('')}
                className="text-xs text-red-900 border border-red-300 px-2 py-0.5 rounded mt-2 hover:bg-white transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {screen === 'home' && (
          <Home
            currentLanguage={currentLanguage}
            setLanguage={setCurrentLanguage}
            onStart={() => setScreen('input')}
          />
        )}
        {screen === 'input' && (
          <InputScreen
            currentLanguage={currentLanguage}
            onBack={() => setScreen('home')}
            onSubmit={handleDescriptionSubmit}
            isLoading={isLoadingMatches}
          />
        )}
        {screen === 'results' && (
          <MatchResults
            currentLanguage={currentLanguage}
            matches={matches}
            onBack={() => setScreen('input')}
            onSelectMatch={handleSelectMatch}
            isSandboxMode={isSandboxMode}
          />
        )}
        {screen === 'support' && userInput && (
          <SupportScreen
            currentLanguage={currentLanguage}
            userInput={userInput}
            onBack={() => setScreen('pathway')}
            onReset={handleReset}
          />
        )}
        {screen === 'pathway' && selectedMatch && userInput && (
          <PathwayScreen
            currentLanguage={currentLanguage}
            match={selectedMatch}
            userInput={userInput}
            detectedLanguage={detectedLanguage}
            onBack={() => setScreen('results')}
            onReset={handleReset}
            onFindSupport={() => setScreen('support')}
          />
        )}
      </main>

      </div>
  );
}
