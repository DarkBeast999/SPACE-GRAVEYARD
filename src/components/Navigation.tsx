import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { playSignalPing, startAmbientDrone, muteAllAudio } from '../utils/audio';

export const Navigation: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { soundEnabled, toggleSound } = useAppStore();

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
                  return `relative px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.2em] transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#58D9FF] text-[#080B1D] font-bold shadow-[0_0_12px_rgba(88,217,255,0.3)]'
                      : 'bg-[#58D9FF]/10 text-[#58D9FF] border border-[#58D9FF]/30 hover:bg-[#58D9FF]/20 hover:border-[#58D9FF]/60'
                  }`;
                }
                return `text-[11px] font-medium tracking-[0.2em] transition-all duration-200 py-1.5 border-b-2 ${
                  isActive
                    ? 'text-[#58D9FF] border-[#58D9FF] font-semibold shadow-[0_4px_12px_rgba(88,217,255,0.2)]'
                    : 'text-[#C8D8EA]/75 border-transparent hover:text-white hover:border-[#58D9FF]/40'
                }`;
              }}
            >
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3.5">
          {/* Master Sound Toggle - Icon Only */}
          <button
            onClick={handleAudioToggle}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border transition-all ${
              soundEnabled
                ? 'border-[#64E5C0] text-[#080B1D] bg-[#64E5C0] shadow-[0_0_12px_rgba(100,229,192,0.35)]'
                : 'border-white/15 text-[#C8D8EA]/75 hover:border-[#58D9FF]/40 hover:text-white bg-[#111A35]/60'
            }`}
            title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            aria-label="Toggle Global Sound"
          >
            <span>{soundEnabled ? '🔊' : '🔇'}</span>
          </button>

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
        <div className="lg:hidden mt-3 pt-3 border-t border-white/10 flex flex-col gap-2 bg-[#080B1D]/98 p-4 rounded-2xl border border-[#58D9FF]/20 shadow-2xl backdrop-blur-xl">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => {
                setMobileMenuOpen(false);
                playSignalPing(750);
              }}
              className={({ isActive }) =>
                `text-xs tracking-[0.2em] px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between ${
                  isActive
                    ? 'text-[#F5F0E8] bg-[#58D9FF]/15 border-l-2 border-[#58D9FF] font-semibold'
                    : 'text-[#C8D8EA] hover:text-[#F5F0E8]'
                }`
              }
            >
              <span>{link.label}</span>
              {link.isPrimary && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#58D9FF] text-[#080B1D] font-bold">
                  3D UNIVERSE
                </span>
              )}
            </NavLink>
          ))}
          <div className="pt-3 border-t border-white/10 flex justify-between items-center px-1">
            <Link
              to="/knowledge"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-[#58D9FF] hover:underline flex items-center gap-1"
            >
              <span>Space Knowledge Centre</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
