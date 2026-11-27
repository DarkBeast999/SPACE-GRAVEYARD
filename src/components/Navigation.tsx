import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { playSignalPing, startAmbientDrone, muteAllAudio } from '../utils/audio';

export const Navigation: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { soundEnabled, toggleSound, visitedArtifacts } = useAppStore();

  const handleAudioToggle = () => {
    const nextState = !soundEnabled;
    toggleSound();
    if (nextState) {
      startAmbientDrone();
      playSignalPing(880);
    } else {
      muteAllAudio();
    }
  };

  const navLinks = [
    { to: '/', label: 'HOME', isPrimary: false },
    { to: '/explore', label: 'EXPLORE', isPrimary: false },
    { to: '/universe', label: '3D UNIVERSE', isPrimary: true },
    { to: '/timeline', label: 'TIMELINE', isPrimary: false },
    { to: '/play', label: 'PLAY', isPrimary: false },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080B1D]/90 backdrop-blur-md border-b border-[#58D9FF]/15 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          onClick={() => playSignalPing(900)}
          className="flex items-center gap-3 group text-decoration-none"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#111A35] to-[#1B284A] border border-[#58D9FF]/40 flex items-center justify-center group-hover:border-[#58D9FF] transition-all shadow-[0_0_15px_rgba(88,217,255,0.2)]">
            <span className="text-sm text-[#58D9FF] group-hover:scale-110 transition-transform">✦</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg tracking-[0.2em] font-medium text-[#F5F0E8] group-hover:text-white transition-colors">
              SPACE GRAVEYARD
            </span>
            <span className="text-[10px] italic font-serif text-[#FFC66D] tracking-wider">
              They Never Came Home.
            </span>
          </div>
        </Link>

        {/* Desktop Nav - 5 Core Destinations */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => playSignalPing(750)}
              className={({ isActive }) => {
                if (link.isPrimary) {
                  return `relative px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.22em] transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#58D9FF] to-[#64E5C0] text-[#080B1D] font-bold shadow-[0_0_20px_rgba(88,217,255,0.4)]'
                      : 'bg-[#58D9FF]/15 text-[#F5F0E8] border border-[#58D9FF]/40 hover:bg-[#58D9FF]/25 hover:border-[#58D9FF] shadow-[0_0_12px_rgba(88,217,255,0.2)]'
                  }`;
                }
                return `text-[11px] font-medium tracking-[0.2em] transition-all duration-200 py-1.5 border-b-2 ${
                  isActive
                    ? 'text-[#58D9FF] border-[#58D9FF] font-semibold shadow-[0_4px_12px_rgba(88,217,255,0.2)]'
                    : 'text-[#C8D8EA]/75 border-transparent hover:text-white hover:border-[#58D9FF]/40'
                }`;
              }}
            >
              {link.isPrimary && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#58D9FF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#64E5C0]"></span>
                </span>
              )}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3.5">
          {/* Master Sound Toggle */}
          <button
            onClick={handleAudioToggle}
            className={`px-3 py-1.5 rounded-full text-[10px] mono tracking-wider flex items-center gap-1.5 border transition-all ${
              soundEnabled
                ? 'border-[#64E5C0] text-[#080B1D] bg-[#64E5C0] font-semibold shadow-[0_0_12px_rgba(100,229,192,0.35)]'
                : 'border-white/10 text-[#C8D8EA]/80 hover:border-white/30 hover:text-white bg-black/30'
            }`}
            title={soundEnabled ? 'Click to MUTE all sound' : 'Click to UNMUTE soundscape'}
            aria-label="Toggle Global Sound"
          >
            <span>{soundEnabled ? '🔊' : '🔇'}</span>
            <span className="hidden sm:inline font-mono">
              {soundEnabled ? 'SOUND: ON' : 'SOUND: OFF'}
            </span>
          </button>

          {/* Permanent Collection Counter */}
          <Link
            to="/explore"
            onClick={() => playSignalPing(600)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111A35]/90 border border-white/15 hover:border-[#58D9FF]/50 transition-all text-[11px] mono text-[#C8D8EA]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFC66D] shadow-[0_0_6px_#FFC66D]" />
            <span>COLLECTION:</span>
            <span className="text-[#F5F0E8] font-semibold">{visitedArtifacts.length} / 28</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-white/10 text-[#F5F0E8]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-white/10 flex flex-col gap-2 bg-[#080D16]/98 p-4 rounded-xl border border-white/10 shadow-2xl">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => {
                setMobileMenuOpen(false);
                playSignalPing(750);
              }}
              className={({ isActive }) =>
                `text-xs tracking-[0.2em] px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                  isActive
                    ? 'text-[#F0E8D9] bg-[#C6A36B]/20 border-l-2 border-[#C6A36B] font-semibold'
                    : 'text-[#B6C0CC] hover:text-[#F0E8D9]'
                }`
              }
            >
              <span>{link.label}</span>
              {link.isPrimary && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#C6A36B] text-[#080D16] font-bold">
                  FLAGSHIP 3D
                </span>
              )}
            </NavLink>
          ))}
          <div className="px-3 py-2 flex items-center justify-between text-xs mono text-[#B6C0CC] border-t border-white/10 mt-2 pt-3">
            <span>PERMANENT COLLECTION</span>
            <span className="text-[#C6A36B] font-bold">{visitedArtifacts.length} / 28 EXPLORED</span>
          </div>
          <div className="pt-2 flex justify-between items-center px-1">
            <Link
              to="/knowledge"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[11px] text-[#C6A36B] hover:underline"
            >
              Space Knowledge Centre →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
