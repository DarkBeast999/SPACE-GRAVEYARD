import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { StarField } from './components/StarField';
import { Navigation } from './components/Navigation';
import { LoadingScreen } from './components/LoadingScreen';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { Universe3DPage } from './pages/Universe3DPage';
import { TimelinePage } from './pages/TimelinePage';
import { PlayPage } from './pages/PlayPage';
import { KnowledgeCentrePage } from './pages/KnowledgeCentrePage';
import { GhostProfilePage } from './pages/GhostProfilePage';
import { AboutModal } from './components/AboutModal';
import { useAppStore } from './store/useAppStore';
import { playSignalPing, startAmbientDrone, muteAllAudio } from './utils/audio';

// Scroll to top automatically when route changes
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const App: React.FC = () => {
  const [hasBooted, setHasBooted] = useState(() => {
    return sessionStorage.getItem('space_graveyard_booted') === 'true';
  });
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const { soundEnabled, toggleSound } = useAppStore();

  const handleBootComplete = () => {
    sessionStorage.setItem('space_graveyard_booted', 'true');
    setHasBooted(true);
  };

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    toggleSound();
    if (next) {
      startAmbientDrone();
      playSignalPing(880);
    } else {
      muteAllAudio();
    }
  };

  return (
    <HashRouter>
      <ScrollToTop />
      {/* Background stars */}
      <StarField />

      {/* Intro boot terminal */}
      {!hasBooted && <LoadingScreen onComplete={handleBootComplete} />}

      {/* Main app container */}
      <div className="relative min-h-screen flex flex-col justify-between selection:bg-[#C6A36B] selection:text-[#080D16]">
        <div>
          <Navigation />
          <main>
            <Routes>
              {/* Core 5 Destinations */}
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/universe" element={<Universe3DPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/play" element={<PlayPage />} />

              {/* Individual Artifact Dossiers */}
              <Route path="/ghost/:artifactId" element={<GhostProfilePage />} />

              {/* Secondary Knowledge Centre */}
              <Route path="/knowledge" element={<KnowledgeCentrePage />} />

              {/* Backward Compatible Route Aliases */}
              <Route path="/ghosts" element={<ExplorePage />} />
              <Route path="/map" element={<Universe3DPage />} />
              <Route path="/game" element={<PlayPage />} />
              <Route path="/educator" element={<KnowledgeCentrePage />} />
              <Route path="/signals" element={<Universe3DPage />} />
              <Route path="/signal-room" element={<Universe3DPage />} />

              {/* Fallback */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
        </div>

        {/* Global Museum Colophon Footer */}
        <footer className="relative z-10 bg-[#080D16]/95 border-t border-[#F0E8D9]/10 py-12 px-4 sm:px-8 text-xs text-[#B6C0CC] mt-24">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            {/* Identity */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-[#C6A36B]">✦</span>
                <span className="font-display text-base font-semibold tracking-[0.2em] text-[#F0E8D9]">
                  SPACE GRAVEYARD
                </span>
              </div>
              <span className="font-serif italic text-xs text-[#C6A36B]">They Never Came Home.</span>
            </div>

            {/* Secondary Footer Destinations */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono">
              <Link
                to="/knowledge"
                onClick={() => playSignalPing(600)}
                className="hover:text-[#F0E8D9] transition-colors"
              >
                FOR EDUCATORS / KNOWLEDGE CENTRE
              </Link>

              <button
                onClick={() => {
                  playSignalPing(600);
                  setIsAboutOpen(true);
                }}
                className="hover:text-[#F0E8D9] transition-colors uppercase"
              >
                ABOUT THE PROJECT
              </button>

              <button
                onClick={handleSoundToggle}
                className="hover:text-[#F0E8D9] transition-colors flex items-center gap-1.5 uppercase"
              >
                <span>{soundEnabled ? '🔊' : '🔇'}</span>
                <span>{soundEnabled ? 'AUDIO: ENABLED' : 'AUDIO: MUTED'}</span>
              </button>
            </div>

            {/* Provenance */}
            <div className="flex flex-col gap-1 text-[11px] mono text-[#B6C0CC]/80">
              <div>28 CURATED LANDMARK MONUMENTS</div>
              <div>PUBLIC DATA: NASA NSSDCA · JPL HORIZONS · UNOOSA</div>
            </div>
          </div>
        </footer>

        {/* About Project Modal */}
        <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      </div>
    </HashRouter>
  );
};

export default App;
