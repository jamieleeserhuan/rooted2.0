/**
 * App.tsx
 * -------
 * Top-level screen router. Manages which screen is shown and passes
 * data between screens. No fetch() calls here — those live in src/api/.
 */
import { useState, useEffect } from 'react';
import { AlertCircle, Languages } from 'lucide-react';
import type { Language, NocMatch, UserInput, Screen } from './types';
import { fetchNocMatches } from './api/match';
import { translations } from './data/translations';
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

  // Each new screen starts at the top of the page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

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
      setMatchError(error.message || translations[currentLanguage].matchError);
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

  const onHome = screen === 'home';
  const t = translations[currentLanguage];

  return (
    <div className={`min-h-svh flex flex-col ${onHome ? 'bg-forest' : 'bg-cream-light'}`} dir={isRtl ? 'rtl' : 'ltr'} lang={currentLanguage === 'dr' ? 'fa-AF' : currentLanguage}>
      {/* Header: same green bar as the website nav */}
      <header className="on-forest bg-forest text-cream border-b border-sage/25">
        <div className="mx-auto max-w-[1120px] px-[20px] sm:px-[40px] min-h-[72px] sm:min-h-[80px] py-[10px] flex flex-wrap items-center justify-between gap-x-[24px] gap-y-[8px]">
          <button
            type="button"
            onClick={() => setScreen('home')}
            className="min-h-[48px] font-serif font-semibold text-[28px] tracking-[-0.01em] text-cream cursor-pointer"
          >
            Rooted
          </button>

          <div className="flex flex-wrap items-center gap-[8px] sm:gap-[12px]">
            {import.meta.env.VITE_USE_MOCK === 'true' && (
              <span className="hidden sm:inline font-mono text-[11px] tracking-[0.14em] uppercase text-gold border border-gold/50 px-2.5 py-1 rounded-md">
                Mock mode
              </span>
            )}

            {/* Language */}
            <label className="relative flex items-center gap-2 min-h-[44px] px-[12px] rounded-[10px] border border-cream/40 text-cream hover:border-cream/70 transition-colors cursor-pointer">
              <Languages aria-hidden="true" className="w-4 h-4 text-sage" />
              <span className="sr-only">{t.selectLanguage}</span>
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value as Language)}
                className="appearance-none bg-transparent border-none outline-none text-[14px] font-medium text-cream cursor-pointer pe-1"
              >
                <option value="en" className="text-forest-deep">English (EN)</option>
                <option value="fr" className="text-forest-deep">Français (FR)</option>
                <option value="ar" className="text-forest-deep">العربية (AR)</option>
                <option value="dr" className="text-forest-deep">دری (DR)</option>
              </select>
            </label>

            {/* Text size */}
            <div role="group" aria-label={t.textSize} className="flex items-center rounded-[10px] border border-cream/40 p-0.5">
              {(['normal', 'large', 'xlarge'] as const).map((size, i) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  aria-pressed={fontSize === size}
                  aria-label={size === 'normal' ? t.textNormal : size === 'large' ? t.textLarge : t.textXL}
                  title={size === 'normal' ? t.textNormal : size === 'large' ? t.textLarge : t.textXL}
                  className={`w-[44px] h-[44px] sm:w-[40px] sm:h-[40px] rounded-[8px] font-serif font-semibold transition-colors cursor-pointer ${
                    i === 0 ? 'text-[14px]' : i === 1 ? 'text-[17px]' : 'text-[20px]'
                  } ${fontSize === size ? 'bg-cream text-forest' : 'text-cream hover:bg-cream/10'}`}
                >
                  A
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Error banner */}
        {matchError && (
          <div role="alert" className="mx-auto mt-6 w-full max-w-[720px] px-5 sm:px-8">
            <div className="flex items-start gap-3 rounded-xl bg-cream px-4 py-4 text-forest-deep">
              <AlertCircle aria-hidden="true" className="w-5 h-5 shrink-0 mt-0.5 text-forest" />
              <div className="flex flex-col gap-2">
                <p className="m-0 text-[0.9375rem] font-medium">{matchError}</p>
                <button
                  type="button"
                  onClick={() => setMatchError('')}
                  className="self-start min-h-[40px] text-[0.875rem] font-medium text-forest underline underline-offset-4 decoration-sage cursor-pointer"
                >
                  {t.dismiss}
                </button>
              </div>
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
