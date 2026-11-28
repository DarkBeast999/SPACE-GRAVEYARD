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
import { playSignalPing } from './utils/audio';

// Scroll to top automatically when route changes
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppShell: React.FC = () => {
  const location = useLocation();
  const [hasBooted, setHasBooted] = useState(() => {
    return sessionStorage.getItem('space_graveyard_booted') === 'true';
  });
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleBootComplete = () => {
    sessionStorage.setItem('space_graveyard_booted', 'true');
    setHasBooted(true);
  };

  const isUniverse = ['/universe', '/map', '/signals', '/signal-room'].includes(location.pathname);
  const isPlayActive = location.pathname === '/play' && location.search.includes('game=');
  const hideFooter = isUniverse || isPlayActive;

  return (
    <>
      <ScrollToTop />
      {/* Background stars */}
      <StarField />

      {/* Intro boot terminal */}
      {!hasBooted && <LoadingScreen onComplete={handleBootComplete} />}

      {/* Main app container */}
      <div className={`relative min-h-screen flex flex-col justify-between selection:bg-[#58D9FF] selection:text-[#080B1D] ${hideFooter ? 'h-screen overflow-hidden' : ''}`}>
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

        {/* Global Museum Colophon Footer - hidden on 3D Universe and active Game viewports */}
        {!hideFooter && (
          <footer className="relative z-10 bg-[#080B1D]/95 border-t border-[#58D9FF]/15 py-12 px-4 sm:px-8 text-xs text-[#C8D8EA] mt-24">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              {/* Identity */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-[#58D9FF]">✦</span>
                  <span className="font-display text-base font-semibold tracking-[0.2em] text-[#F5F0E8]">
                    SPACE GRAVEYARD
                  </span>
                </div>
                <span className="font-serif italic text-xs text-[#FFC66D]">They Never Came Home.</span>
              </div>

              {/* Secondary Footer Destinations */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono">
                <Link
                  to="/knowledge"
                  onClick={() => playSignalPing(600)}
                  className="hover:text-[#58D9FF] transition-colors"
                >
                  FOR EDUCATORS / KNOWLEDGE CENTRE
                </Link>

                <button
                  onClick={() => {
                    playSignalPing(600);
                    setIsAboutOpen(true);
                  }}
                  className="hover:text-[#58D9FF] transition-colors uppercase cursor-pointer"
                >
                  ABOUT THE PROJECT
                </button>
              </div>

              {/* Provenance */}
              <div className="flex flex-col gap-1 text-[11px] mono text-[#C8D8EA]/75">
                <div>28 CURATED LANDMARK MONUMENTS</div>
                <div>PUBLIC DATA: NASA NSSDCA · JPL HORIZONS · UNOOSA</div>
              </div>
            </div>
          </footer>
        )}

        {/* About Project Modal */}
        <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      </div>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  );
};

export default App;
