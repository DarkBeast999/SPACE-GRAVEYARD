import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getArtifactById } from '../data/artifacts';
import { useAppStore } from '../store/useAppStore';
import { formatSilenceDuration, getSignalDelay } from '../utils/timeUtils';
import { formatCoordinates, getCoordinateSemanticLabel } from '../utils/coordinateUtils';
import { resolveSource } from '../utils/sourceUtils';
import { playSignalPing, playTypewriterClick, playWhooshSound } from '../utils/audio';
import { getMissionStory } from '../data/missionStories';

export const GhostProfilePage: React.FC = () => {
  const { artifactId } = useParams<{ artifactId: string }>();
  const navigate = useNavigate();
  const { markVisited, incrementGhostMails } = useAppStore();

  const artifact = getArtifactById(artifactId);

  // Mark visited
  useEffect(() => {
    if (artifact) {
      markVisited(artifact.id);
    }
  }, [artifact, markVisited]);

  // Live ticking silence duration
  const [silenceDuration, setSilenceDuration] = useState(() =>
    artifact?.lastContact ? formatSilenceDuration(artifact.lastContact) : null
  );

  useEffect(() => {
    if (!artifact?.lastContact) return;
    const interval = setInterval(() => {
      setSilenceDuration(formatSilenceDuration(artifact.lastContact!));
    }, 1000);
    return () => clearInterval(interval);
  }, [artifact?.lastContact]);

  // Ghost Mail postcard state
  const [userMessage, setUserMessage] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [postcardReady, setPostcardReady] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const postcardCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Technical drawer toggle
  const [showTechnicalSpecs, setShowTechnicalSpecs] = useState(false);

  // If artifact not found, display 404 state
  if (!artifact) {
    return (
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-24 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#101A29] border border-[#C6A36B]/40 flex items-center justify-center text-2xl text-[#C6A36B] mb-6">
          ✦
        </div>
        <div className="font-mono text-xs text-[#C6A36B] uppercase tracking-widest mb-3 font-semibold">
          CATALOG RECORD UNRESOLVED
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-[#F0E8D9] mb-4">
          Explorer Record Not Found
        </h1>
        <p className="text-sm text-[#B6C0CC] max-w-lg mb-8 leading-relaxed font-light">
          No hardware archive was recovered for identifier <code className="text-[#F0E8D9] bg-black/40 px-2 py-1 rounded font-mono">"{artifactId}"</code>.
        </p>
        <Link
          to="/explore"
          className="px-6 py-3 rounded-xl font-sans text-xs font-semibold tracking-wider bg-[#C6A36B] text-[#080D16] hover:bg-[#d8b57d] transition-all"
        >
          RETURN TO PERMANENT COLLECTION (28 EXPLORERS) ➔
        </Link>
      </div>
    );
  }

  // Coordinates and semantics
  const formattedCoords = formatCoordinates(artifact.coordinates);
  const coordSemanticLabel = getCoordinateSemanticLabel(artifact.destination, Boolean(artifact.coordinates));

  // Destination visual theme
  const getDestinationTheme = (dest: string) => {
    switch (dest) {
      case 'mars':
        return {
          accent: '#FF8D7B',
          accentBorder: 'border-[#FF8D7B]/40',
          accentBorderHover: 'hover:border-[#FF8D7B]/60',
          accentBg: 'bg-[#FF8D7B]/15',
          accentText: 'text-[#FF8D7B]',
          badgeBorder: 'border-[#FF8D7B]/50',
          glow: 'shadow-[0_0_30px_rgba(255,141,123,0.18)]',
          heroGradient: 'from-[#2A161E]/90 via-[#111A35]/85 to-[#080B1D]/95',
          bannerBg: 'from-[#FF8D7B]/20 via-[#1B284A]/70 to-[#111A35]/90',
        };
      case 'moon':
        return {
          accent: '#C8D8EA',
          accentBorder: 'border-[#C8D8EA]/40',
          accentBorderHover: 'hover:border-[#C8D8EA]/60',
          accentBg: 'bg-[#C8D8EA]/15',
          accentText: 'text-[#C8D8EA]',
          badgeBorder: 'border-[#C8D8EA]/50',
          glow: 'shadow-[0_0_30px_rgba(200,216,234,0.18)]',
          heroGradient: 'from-[#1B284A]/90 via-[#111A35]/85 to-[#080B1D]/95',
          bannerBg: 'from-[#C8D8EA]/20 via-[#1B284A]/70 to-[#111A35]/90',
        };
      case 'saturn':
        return {
          accent: '#FFC66D',
          accentBorder: 'border-[#FFC66D]/40',
          accentBorderHover: 'hover:border-[#FFC66D]/60',
          accentBg: 'bg-[#FFC66D]/15',
          accentText: 'text-[#FFC66D]',
          badgeBorder: 'border-[#FFC66D]/50',
          glow: 'shadow-[0_0_30px_rgba(255,198,109,0.18)]',
          heroGradient: 'from-[#2A2318]/90 via-[#111A35]/85 to-[#080B1D]/95',
          bannerBg: 'from-[#FFC66D]/20 via-[#1B284A]/70 to-[#111A35]/90',
        };
      case 'deep-space':
      default:
        return {
          accent: '#58D9FF',
          accentBorder: 'border-[#58D9FF]/40',
          accentBorderHover: 'hover:border-[#58D9FF]/60',
          accentBg: 'bg-[#58D9FF]/15',
          accentText: 'text-[#58D9FF]',
          badgeBorder: 'border-[#58D9FF]/50',
          glow: 'shadow-[0_0_30px_rgba(88,217,255,0.18)]',
          heroGradient: 'from-[#0E2A3A]/90 via-[#111A35]/85 to-[#080B1D]/95',
          bannerBg: 'from-[#58D9FF]/20 via-[#1B284A]/70 to-[#111A35]/90',
        };
    }
  };

  const theme = getDestinationTheme(artifact.destination);

  // Full curated historical story
  const missionStory = getMissionStory(artifact.id);

  // Speed of light travel calculation based on realistic distance from Earth
  const getEarthDistanceKm = () => {
    if (artifact.id === 'voyager-1') return 24_900_000_000;
    if (artifact.id === 'voyager-2') return 20_900_000_000;
    if (artifact.id === 'pioneer-10') return 20_200_000_000;
    if (artifact.id === 'pioneer-11') return 16_500_000_000;
    if (artifact.id === 'new-horizons') return 8_700_000_000;
    if (artifact.id === 'cassini') return 1_430_000_000;
    if (artifact.destination === 'moon') return 384_400;
    if (artifact.destination === 'mars') return 225_000_000; // ~1.5 AU average distance
    if (artifact.destination === 'deep-space') return Math.max(artifact.distanceTraveledKm, 1_000_000_000);
    return 384_400;
  };

  const travelDelay = getSignalDelay(getEarthDistanceKm());

  // Natural language status helper
  const getNaturalStatus = () => {
    if (artifact.status === 'active') return 'STILL OPERATING';
    if (artifact.destination === 'deep-space') return 'TRAVELLING THROUGH DEEP SPACE';
    return 'RESTING ON PLANETARY SURFACE';
  };

  // Postcard transmit handler
  const handleTransmitMail = () => {
    if (isTransmitting || !userMessage.trim()) return;
    setGenerationError(null);
    playSignalPing(1100);
    setIsTransmitting(true);

    setTimeout(() => {
      try {
        const success = renderPostcard();
        if (success) {
          playSignalPing(1400);
          setPostcardReady(true);
          incrementGhostMails();
        } else {
          setGenerationError('Failed to render commemorative postcard. Please try again.');
        }
      } catch (err) {
        console.error('Postcard rendering error:', err);
        setGenerationError('An unexpected error occurred while creating the postcard. Please try again.');
      } finally {
        setIsTransmitting(false);
      }
    }, 1200);
  };

  // High-Resolution Postcard Renderer (1600 × 1000 pixels)
  const renderPostcard = (): boolean => {
    try {
      const canvas = postcardCanvasRef.current;
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      canvas.width = 1600;
      canvas.height = 1000;

      const bg = ctx.createLinearGradient(0, 0, 1600, 1000);
      bg.addColorStop(0, '#0d1522');
      bg.addColorStop(0.5, '#080d16');
      bg.addColorStop(1, '#05080e');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1600, 1000);

      ctx.strokeStyle = '#C6A36B';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(36, 36, 1528, 928);

      ctx.strokeStyle = 'rgba(198, 163, 107, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(50, 50, 1500, 900);

      ctx.strokeStyle = 'rgba(198, 163, 107, 0.5)';
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(1260, 75, 250, 280);
      ctx.setLineDash([]);

      ctx.fillStyle = '#C6A36B';
      ctx.font = 'bold 20px JetBrains Mono, monospace';
      ctx.fillText('DEEP SPACE', 1315, 140);
      ctx.fillText('HISTORICAL', 1315, 185);
      ctx.fillText('POSTAGE', 1335, 230);
      ctx.font = '28px serif';
      ctx.fillText('✦ ✦ ✦', 1335, 290);

      ctx.fillStyle = '#F0E8D9';
      ctx.font = 'italic 50px Cormorant Garamond, Georgia, serif';
      ctx.fillText(`Transmission to ${artifact.name}`, 90, 140);

      ctx.fillStyle = '#B6C0CC';
      ctx.font = '22px JetBrains Mono, monospace';
      ctx.fillText(`DESTINATION: ${artifact.location.toUpperCase()}`, 90, 195);
      if (formattedCoords) {
        ctx.fillText(`${coordSemanticLabel.toUpperCase()}: ${formattedCoords}`, 90, 235);
      }
      ctx.fillText(
        `LIGHT-TRAVEL DELAY: ${travelDelay.hours}h ${travelDelay.minutes}m ${travelDelay.seconds}s (c ≈ 299,792 km/s)`,
        90,
        formattedCoords ? 275 : 240
      );

      ctx.strokeStyle = 'rgba(198, 163, 107, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(90, 315);
      ctx.lineTo(1220, 315);
      ctx.stroke();

      const msgLen = userMessage.length;
      let fontSize = 36;
      let lineHeight = 56;
      if (msgLen > 200) {
        fontSize = 26;
        lineHeight = 42;
      } else if (msgLen > 120) {
        fontSize = 30;
        lineHeight = 48;
      }
      ctx.fillStyle = '#F0E8D9';
      ctx.font = `italic ${fontSize}px Inter, sans-serif`;

      const maxWidth = 1420;
      const maxY = 880;
      const paragraphs = userMessage.split('\n');
      let y = 390;

      for (let p = 0; p < paragraphs.length; p++) {
        const paragraph = paragraphs[p].trim();
        if (!paragraph) {
          y += lineHeight * 0.7;
          if (y > maxY) break;
          continue;
        }

        const words = paragraph.split(/\s+/);
        let line = '';

        for (let i = 0; i < words.length; i++) {
          const testLine = line ? `${line} ${words[i]}` : words[i];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line) {
            ctx.fillText(line, 90, y);
            line = words[i];
            y += lineHeight;
            if (y > maxY) break;
          } else {
            line = testLine;
          }
        }

        if (y > maxY) break;

        if (line) {
          ctx.fillText(line, 90, y);
          y += lineHeight;
        }
      }

      ctx.fillStyle = 'rgba(182, 192, 204, 0.65)';
      ctx.font = '20px JetBrains Mono, monospace';
      ctx.fillText(
        'SPACE GRAVEYARD // EDUCATIONAL ARCHIVE OF HUMAN EXPLORATION',
        90,
        920
      );

      return true;
    } catch (err) {
      console.error('renderPostcard exception:', err);
      return false;
    }
  };

  const downloadPostcard = () => {
    try {
      const canvas = postcardCanvasRef.current;
      if (!canvas) {
        setGenerationError('Postcard canvas was not found. Please regenerate.');
        return;
      }
      const url = canvas.toDataURL('image/png');
      if (!url || url === 'data:,') {
        setGenerationError('Failed to export postcard image. Please try again.');
        return;
      }
      const a = document.createElement('a');
      a.href = url;
      a.download = `space-graveyard-${artifact.id}-postcard.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download postcard error:', err);
      setGenerationError('Failed to download postcard image. Please try again.');
    }
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Top Breadcrumb */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          to="/explore"
          onClick={() => playSignalPing(500)}
          className={`inline-flex items-center gap-2 font-mono text-xs ${theme.accentText} hover:text-[#F5F0E8] transition-colors tracking-wider`}
        >
          <span>←</span>
          <span>RETURN TO PERMANENT COLLECTION</span>
        </Link>
        <button
          onClick={() => {
            playWhooshSound();
            navigate(`/universe?planet=${artifact.destination}&target=${artifact.id}`);
          }}
          className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full ${theme.accentBg} ${theme.accentText} hover:bg-white/20 hover:text-[#F5F0E8] border ${theme.badgeBorder} transition-all font-mono text-[11px] font-semibold`}
        >
          <span>🌐 VIEW IN 3D UNIVERSE</span>
          <span>↗</span>
        </button>
      </div>

      {/* 1. WHAT IS THIS MACHINE? (HERO SECTION WITH DESTINATION VISUAL IDENTITY) */}
      <div className={`p-8 sm:p-12 rounded-3xl border ${theme.accentBorder} mb-10 relative overflow-hidden bg-gradient-to-b ${theme.heroGradient} ${theme.glow} shadow-2xl backdrop-blur-xl`}>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }} />
              <span className={`font-mono text-xs ${theme.accentText} uppercase tracking-widest font-semibold`}>
                CURATED MISSION DOSSIER // {artifact.destination.toUpperCase()}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-normal text-[#F5F0E8] tracking-tight mb-4">
              {artifact.name}
            </h1>

            <div className="text-xs sm:text-sm text-[#C8D8EA] flex flex-wrap items-center gap-3 font-sans">
              <span className="text-[#F5F0E8] font-medium">{artifact.designation}</span>
              <span>•</span>
              <span>📍 {artifact.location}</span>
              {formattedCoords && (
                <>
                  <span>•</span>
                  <span className="font-mono text-[11px] text-[#C8D8EA]/80">{coordSemanticLabel}: {formattedCoords}</span>
                </>
              )}
            </div>

            {/* 1-Line Punchy Accessible Summary */}
            <p className="mt-4 text-base sm:text-lg font-serif italic text-[#F5F0E8]/95 leading-relaxed max-w-2xl">
              "{artifact.funFact}"
            </p>
          </div>

          {/* Status Badge & Silence Duration */}
          <div className="flex flex-col items-start lg:items-end gap-3 flex-shrink-0">
            <span className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wider border ${theme.badgeBorder} ${theme.accentBg} text-[#F5F0E8]`}>
              ● {getNaturalStatus()}
            </span>

            {silenceDuration && (
              <div className="bg-black/50 px-5 py-3 rounded-2xl border border-white/10 text-left lg:text-right">
                <div className="font-mono text-[10px] text-[#C8D8EA] uppercase tracking-wider mb-0.5">
                  TIME ON SITE
                </div>
                <div className="font-display text-lg sm:text-xl" style={{ color: theme.accent }}>
                  {silenceDuration.days.toLocaleString()} Days
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. COMPLETE HISTORICAL CHRONICLE (EDITORIAL MUSEUM EXPERIENCE) */}
      <section className="mb-14">
        {missionStory ? (
          <div className="space-y-8">
            {/* Chronicle Header & Title Banner */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className={`font-mono text-xs ${theme.accentText} uppercase tracking-widest flex items-center gap-2 mb-2 font-semibold`}>
                  <span>📜</span>
                  <span>HISTORICAL MISSION CHRONICLE</span>
                </div>
                <h2 className="font-display text-3xl sm:text-5xl text-[#F5F0E8] font-normal leading-tight">
                  {missionStory.title}
                </h2>
                <div className={`font-mono text-xs ${theme.accentText}/90 tracking-wider uppercase mt-1`}>
                  {missionStory.subtitle}
                </div>
              </div>

              <button
                onClick={() => {
                  playTypewriterClick();
                  playSignalPing(750);
                }}
                className="font-mono text-[11px] text-[#C8D8EA] hover:text-white transition-colors flex items-center gap-1.5 self-start sm:self-end bg-white/5 px-3.5 py-1.5 rounded-lg border border-white/10"
                title="Simulate carrier frequency"
              >
                <span>🔊</span>
                <span>RADIO CARRIER (TONE)</span>
              </button>
            </div>

            {/* Opening Lead Passage */}
            <div
              className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-r ${theme.bannerBg} border-l-4 shadow-xl border-y border-r border-white/10`}
              style={{ borderLeftColor: theme.accent }}
            >
              <div className="font-serif italic text-lg sm:text-2xl text-[#F5F0E8] leading-relaxed">
                <span className="text-3xl leading-none select-none opacity-40 mr-1">“</span>
                {missionStory.lead}
                <span className="text-3xl leading-none select-none opacity-40 ml-1">”</span>
              </div>
            </div>

            {/* Narrative Chapters (Visually Varied Progression) */}
            <div className="space-y-7">
              {/* CHAPTER 1: ORIGIN & LAUNCH */}
              {missionStory.chapters.origin && (
                <div className="p-6 sm:p-8 rounded-3xl bg-[#111A35]/80 border border-white/10 backdrop-blur-md shadow-lg transition-all hover:border-white/20 relative overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-white/5 border border-white/10 font-mono text-[10px] font-bold flex items-center justify-center text-[#58D9FF]">
                        01
                      </span>
                      <span className="font-mono text-[10px] text-[#58D9FF] uppercase tracking-widest font-semibold">
                        CHAPTER I // ORIGIN &amp; MISSION GENESIS
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-[#C8D8EA]/80">
                      <span className="bg-black/40 px-2.5 py-0.5 rounded border border-white/5">ARCHIVAL DESIGNATION: {artifact.designation}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                    <h3 className="font-display text-xl sm:text-2xl text-[#F5F0E8] font-medium tracking-tight">
                      {missionStory.chapters.origin.title}
                    </h3>
                    {missionStory.chapters.origin.subtitle && (
                      <span className={`font-mono text-[11px] ${theme.accentText} uppercase tracking-wider`}>
                        {missionStory.chapters.origin.subtitle}
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base text-[#F5F0E8]/90 leading-relaxed font-sans font-light mt-3">
                    {missionStory.chapters.origin.content}
                  </p>
                </div>
              )}

              {/* CHAPTER 2: THE JOURNEY THROUGH THE VOID */}
              {missionStory.chapters.journey && (
                <div className="p-6 sm:p-8 rounded-3xl bg-[#111A35]/70 border border-white/10 backdrop-blur-md shadow-lg transition-all hover:border-white/20 relative">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                    <span className="w-5 h-5 rounded-md bg-white/5 border border-white/10 font-mono text-[10px] font-bold flex items-center justify-center text-[#A18BFF]">
                      02
                    </span>
                    <span className="font-mono text-[10px] text-[#A18BFF] uppercase tracking-widest font-semibold">
                      CHAPTER II // THE JOURNEY &amp; DEEP SPACE TRANSIT
                    </span>
                  </div>

                  <div className="pl-4 sm:pl-6 border-l-2 border-[#A18BFF]/40 relative">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#A18BFF]" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                      <h3 className="font-display text-xl sm:text-2xl text-[#F5F0E8] font-medium tracking-tight">
                        {missionStory.chapters.journey.title}
                      </h3>
                      {missionStory.chapters.journey.subtitle && (
                        <span className="font-mono text-[11px] text-[#A18BFF] uppercase tracking-wider">
                          {missionStory.chapters.journey.subtitle}
                        </span>
                      )}
                    </div>

                    <p className="text-sm sm:text-base text-[#F5F0E8]/90 leading-relaxed font-sans font-light mt-3">
                      {missionStory.chapters.journey.content}
                    </p>
                  </div>
                </div>
              )}

              {/* CHAPTER 3: PIVOTAL MOMENTS & HIGH-STAKES OPERATIONS */}
              {missionStory.chapters.keyMoments && (
                <div
                  className={`p-6 sm:p-8 rounded-3xl bg-[#1B284A]/60 border ${theme.accentBorder} backdrop-blur-md shadow-xl transition-all relative overflow-hidden`}
                >
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                    <span className="w-5 h-5 rounded-md bg-white/5 border border-white/10 font-mono text-[10px] font-bold flex items-center justify-center" style={{ color: theme.accent }}>
                      03
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest font-semibold" style={{ color: theme.accent }}>
                      CHAPTER III // PIVOTAL MOMENTS &amp; CRUCIAL OPERATIONS
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                    <h3 className="font-display text-xl sm:text-2xl text-[#F5F0E8] font-medium tracking-tight">
                      {missionStory.chapters.keyMoments.title}
                    </h3>
                    {missionStory.chapters.keyMoments.subtitle && (
                      <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: theme.accent }}>
                        {missionStory.chapters.keyMoments.subtitle}
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base text-[#F5F0E8]/90 leading-relaxed font-sans font-light mt-3">
                    {missionStory.chapters.keyMoments.content}
                  </p>
                </div>
              )}

              {/* CHAPTER 4: SCIENTIFIC DISCOVERIES & RETURN */}
              {missionStory.chapters.discoveries && (
                <div className="p-6 sm:p-8 rounded-3xl bg-[#111A35]/80 border border-white/10 backdrop-blur-md shadow-lg transition-all hover:border-white/20">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                    <span className="w-5 h-5 rounded-md bg-white/5 border border-white/10 font-mono text-[10px] font-bold flex items-center justify-center text-[#64E5C0]">
                      04
                    </span>
                    <span className="font-mono text-[10px] text-[#64E5C0] uppercase tracking-widest font-semibold">
                      CHAPTER IV // DISCOVERIES &amp; SCIENTIFIC RETURN
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                    <h3 className="font-display text-xl sm:text-2xl text-[#F5F0E8] font-medium tracking-tight">
                      {missionStory.chapters.discoveries.title}
                    </h3>
                    {missionStory.chapters.discoveries.subtitle && (
                      <span className="font-mono text-[11px] text-[#64E5C0] uppercase tracking-wider">
                        {missionStory.chapters.discoveries.subtitle}
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base text-[#F5F0E8]/90 leading-relaxed font-sans font-light mt-3">
                    {missionStory.chapters.discoveries.content}
                  </p>
                </div>
              )}

              {/* CHAPTER 5: PERMANENT RESTING PLACE & ETERNAL LEGACY */}
              {missionStory.chapters.legacy && (
                <div className="p-6 sm:p-8 rounded-3xl bg-[#080B1D]/90 border border-white/15 backdrop-blur-md shadow-xl relative">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-white/5 border border-white/10 font-mono text-[10px] font-bold flex items-center justify-center text-[#FFC66D]">
                        05
                      </span>
                      <span className="font-mono text-[10px] text-[#FFC66D] uppercase tracking-widest font-semibold">
                        CHAPTER V // PERMANENT RESTING PLACE &amp; ETERNAL LEGACY
                      </span>
                    </div>

                    <div className="font-mono text-[10px] text-[#C8D8EA] bg-black/60 px-2.5 py-0.5 rounded border border-white/5">
                      SITE: {artifact.location}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                    <h3 className="font-display text-xl sm:text-2xl text-[#F5F0E8] font-medium tracking-tight">
                      {missionStory.chapters.legacy.title}
                    </h3>
                    {missionStory.chapters.legacy.subtitle && (
                      <span className="font-mono text-[11px] text-[#FFC66D] uppercase tracking-wider">
                        {missionStory.chapters.legacy.subtitle}
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base text-[#F5F0E8]/90 leading-relaxed font-sans font-light mt-3">
                    {missionStory.chapters.legacy.content}
                  </p>
                </div>
              )}
            </div>

            {/* Highlight Quote Block */}
            {missionStory.highlightQuote && (
              <div className={`p-6 sm:p-8 rounded-2xl bg-[#080B1D]/95 border ${theme.accentBorder} relative overflow-hidden shadow-xl`}>
                <div className="text-3xl font-display select-none mb-1 opacity-50" style={{ color: theme.accent }}>“</div>
                <blockquote className="font-serif italic text-lg sm:text-xl text-[#F5F0E8] leading-relaxed mb-3">
                  {missionStory.highlightQuote}
                </blockquote>
                {missionStory.quoteAuthor && (
                  <div className={`font-mono text-xs ${theme.accentText} uppercase tracking-wider text-right`}>
                    — {missionStory.quoteAuthor}
                  </div>
                )}
              </div>
            )}

            {/* Interpretive First-Person Reflection (Clearly Demarcated) */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#080B1D]/85 backdrop-blur-sm">
              <div className="mb-3 bg-black/50 border border-[#FFC66D]/30 rounded-xl p-3.5 text-xs text-[#C8D8EA] flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
                <div className="flex items-center gap-1.5 text-[#FFC66D] font-mono font-semibold tracking-wider uppercase text-[11px] flex-shrink-0">
                  <span>✦</span>
                  <span>CREATIVE RECONSTRUCTION DISCLOSURE:</span>
                </div>
                <p className="font-sans font-light text-[11px] text-[#C8D8EA] leading-relaxed">
                  The passage below is an artistic interpretive reflection based on historical flight logs. It is not an actual spacecraft transmission, recovered recording, or verbatim transcript.
                </p>
              </div>

              <p className="font-serif italic text-base sm:text-lg text-[#F5F0E8]/85 leading-relaxed pl-3 border-l-2" style={{ borderLeftColor: theme.accent }}>
                "{artifact.lastTransmission || artifact.narrativeIntro}"
              </p>

              <div className="flex flex-wrap items-center justify-between pt-4 mt-4 border-t border-white/10 text-xs font-mono text-[#C8D8EA]">
                <div>RESTING SITE: <span className="text-[#F5F0E8]">{artifact.location}</span></div>
                <div>VERIFIED STATUS: <span style={{ color: theme.accent }}>{missionStory.verifiedStatus}</span></div>
              </div>
            </div>
          </div>
        ) : (
          /* Fallback for unindexed records */
          <div className="p-8 sm:p-12 rounded-3xl border border-white/10 relative overflow-hidden bg-[#101A29]/70 backdrop-blur-md shadow-xl">
            <div className="mb-6 bg-[#080D16]/90 border border-[#C6A36B]/35 rounded-2xl p-4 text-xs text-[#B6C0CC] flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 text-[#C6A36B] font-mono font-semibold tracking-wider uppercase text-[11px] flex-shrink-0">
                <span>✦</span>
                <span>CREATIVE RECONSTRUCTION:</span>
              </div>
              <p className="font-sans font-light leading-relaxed">
                This first-person account is an interpretive narrative based on historical mission logs.
              </p>
            </div>
            <div className="text-4xl text-[#C6A36B]/40 font-display mb-2 select-none">“</div>
            <p className="font-display italic text-xl sm:text-2xl text-[#F0E8D9] leading-relaxed font-light mb-8">
              {artifact.lastTransmission || artifact.narrativeIntro}
            </p>
            <div className="flex flex-wrap items-center justify-between pt-6 border-t border-white/10 text-xs font-mono text-[#B6C0CC]">
              <div>RESTING SITE: <span className="text-[#F0E8D9]">{artifact.location}</span></div>
              <div>CURRENT STATUS: <span className="text-[#F0E8D9]">{getNaturalStatus()}</span></div>
            </div>
          </div>
        )}
      </section>

      {/* 3. WHAT DID IT DISCOVER? (VISUAL DISCOVERY CARDS) */}
      <section className="mb-12">
        <div className={`font-mono text-xs ${theme.accentText} uppercase tracking-widest mb-4 flex items-center gap-2 font-semibold`}>
          <span>🔬</span>
          <span>EXTRAORDINARY DISCOVERIES MADE BY THIS MISSION</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {artifact.discoveries.map((discovery, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className={`p-6 sm:p-7 rounded-2xl border border-white/10 ${theme.accentBorderHover} transition-all flex flex-col justify-between bg-[#111A35]/70 shadow-lg backdrop-blur-sm`}
            >
              <div>
                <div className="text-3xl mb-4">{discovery.emoji}</div>
                <h3 className="font-display text-lg font-medium text-[#F5F0E8] mb-2 leading-snug">
                  {discovery.title}
                </h3>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold mb-3 ${
                    discovery.significance === 'critical'
                      ? `${theme.accentBg} ${theme.accentText} border ${theme.badgeBorder}`
                      : 'bg-white/5 text-[#C8D8EA] border border-white/10'
                  }`}
                >
                  {discovery.significance} BREAKTHROUGH
                </span>
                <p className="text-xs sm:text-sm text-[#C8D8EA] leading-relaxed font-sans font-light">
                  {discovery.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. WHERE IS IT NOW? + 3D UNIVERSE CONNECTION */}
      <section className={`p-8 sm:p-10 rounded-3xl border ${theme.accentBorder} bg-[#111A35]/80 mb-12 shadow-2xl backdrop-blur-md`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className={`font-mono text-xs ${theme.accentText} uppercase tracking-widest block mb-2 font-semibold`}>
              📍 LOCATION &amp; 3D EXPLORATION
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-[#F5F0E8] font-medium leading-tight mb-2">
              Explore {artifact.name} on the 3D Globe
            </h2>
            <p className="text-sm text-[#C8D8EA] leading-relaxed font-light">
              This explorer rests at {artifact.location}. Open our interactive 3D Solar System to glide straight to its resting site, inspect the terrain, and explore nearby historic landmarks.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <button
              onClick={() => {
                playWhooshSound();
                navigate(`/universe?planet=${artifact.destination}&target=${artifact.id}`);
              }}
              className="px-6 py-3 rounded-xl bg-[#FFC66D] hover:bg-[#ffe09e] text-[#080B1D] font-sans text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🌐 FIND IT IN 3D UNIVERSE</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. CAN YOU REACH IT? (LIGHT-SPEED DELAY CALCULATOR) */}
      <section className="p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#080B1D]/90 mb-12 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📡</span>
          <span className="font-mono text-xs text-[#58D9FF] uppercase tracking-widest font-semibold">
            SPEED-OF-LIGHT DELAY // HOW LONG DOES A SIGNAL TAKE?
          </span>
        </div>

        <h3 className="font-display text-2xl text-[#F5F0E8] font-medium mb-3">
          Communicating Across the Void
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <p className="text-sm text-[#C8D8EA] leading-relaxed font-light">
              Radio waves travel at the speed of light (<span className="text-[#58D9FF] font-mono font-medium">~299,792 km/s</span>). 
              Because {artifact.name} is situated in {artifact.location}, any message beamed from Earth takes{' '}
              <span className="text-[#F5F0E8] font-semibold font-mono">
                {travelDelay.hours > 0 ? `${travelDelay.hours} hours ` : ''}
                {travelDelay.minutes > 0 ? `${travelDelay.minutes} minutes ` : ''}
                {travelDelay.seconds} seconds
              </span>{' '}
              to reach it in one direction.
            </p>
            <p className="text-xs text-[#C8D8EA]/70 mt-3 font-serif italic">
              NASA uses giant 70-meter dish antennas of the Deep Space Network located in California, Spain, and Australia to send and listen for these faint signals.
            </p>
          </div>

          <div className="bg-[#101A29] p-5 rounded-2xl border border-white/10 text-center">
            <div className="text-[10px] mono text-[#38bdf8] uppercase tracking-widest mb-1">
              ONE-WAY LIGHT TIME
            </div>
            <div className="font-display text-2xl text-[#F0E8D9] font-semibold">
              {travelDelay.hours > 0 ? `${travelDelay.hours}h ` : ''}
              {travelDelay.minutes > 0 ? `${travelDelay.minutes}m ` : ''}
              {travelDelay.seconds}s
            </div>
            <a
              href="https://eyes.nasa.gov/dsn/dsn.html"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-[11px] mono text-[#38bdf8] underline hover:text-white"
            >
              View Live NASA DSN Dishes ↗
            </a>
          </div>
        </div>
      </section>

      {/* 6. CREATE A MISSION POSTCARD (INTEGRATED GHOST MAIL) */}
      <section className="p-8 sm:p-12 rounded-3xl border border-white/10 mb-12 relative overflow-hidden bg-[#101A29]/75 shadow-xl">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="font-mono text-xs text-[#C6A36B] uppercase tracking-widest flex items-center gap-1.5 font-semibold">
              <span>✦</span>
              <span>CREATE A COMMEMORATIVE POSTCARD // {artifact.name.toUpperCase()}</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#B6C0CC] border border-white/10">
              HIGH-RES 1600×1000 PNG
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-[#F0E8D9] mb-3 font-medium">
            Send a Personal Tribute Across Time
          </h2>
          <p className="text-sm text-[#B6C0CC] mb-6 leading-relaxed font-sans font-light">
            Write an educational tribute or reflection dedicated to this machine. 
            Your words will be rendered onto a high-resolution collector's stationery postcard that you can download and keep.
          </p>

          {/* Postcard Creation Form */}
          <div className={!postcardReady ? "space-y-4" : "hidden"}>
            {generationError && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 font-mono text-xs flex items-center justify-between">
                <span>⚠️ {generationError}</span>
                <button
                  onClick={() => setGenerationError(null)}
                  className="text-red-400 hover:text-red-200 text-sm ml-2 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              disabled={isTransmitting}
              placeholder={`To ${artifact.name}: Thank you for your tireless journey and extraordinary discoveries...`}
              rows={4}
              maxLength={280}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/15 focus:border-[#C6A36B] focus:outline-none text-[#F0E8D9] placeholder-white/30 text-sm font-sans disabled:opacity-50"
            />

            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#B6C0CC]">
                {userMessage.length}/280 CHARACTERS
              </span>

              <button
                onClick={handleTransmitMail}
                disabled={!userMessage.trim() || isTransmitting}
                className="px-6 py-3 rounded-xl font-sans text-xs font-bold tracking-wider text-[#080D16] bg-[#C6A36B] hover:bg-[#d8b57d] disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isTransmitting ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#080D16] animate-ping" />
                    <span>GENERATING POSTCARD...</span>
                  </>
                ) : (
                  <>
                    <span>CREATE POSTCARD ➔</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Postcard Preview & Actions (Always mounted in DOM so canvasRef is never null, toggled via CSS) */}
          <div className={postcardReady ? "space-y-6" : "hidden"}>
            <div className="p-4 rounded-xl bg-[#C6A36B]/15 border border-[#C6A36B]/40 text-[#C6A36B] font-mono text-xs">
              ✦ COMMEMORATIVE CARD READY: Your high-resolution 1600×1000 museum postcard is rendered below.
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
              <canvas ref={postcardCanvasRef} className="w-full h-auto block" />
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={downloadPostcard}
                className="px-6 py-3 rounded-xl font-sans text-xs font-semibold bg-[#C6A36B] text-[#080D16] hover:bg-[#d8b57d] transition-all cursor-pointer"
              >
                DOWNLOAD HIGH-RES POSTCARD (PNG)
              </button>
              <button
                onClick={() => {
                  setPostcardReady(false);
                  setUserMessage('');
                  setGenerationError(null);
                }}
                className="px-6 py-3 rounded-xl font-sans text-xs font-medium bg-white/5 text-[#F0E8D9] border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                CREATE ANOTHER
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. OPTIONAL TECHNICAL SPECIFICATIONS & CITATIONS (EXPANDABLE DRAWER) */}
      <section className="mb-12">
        <button
          onClick={() => setShowTechnicalSpecs(!showTechnicalSpecs)}
          className="w-full py-4 px-6 rounded-2xl bg-[#101A29]/60 hover:bg-[#101A29] border border-white/10 flex items-center justify-between text-xs font-mono text-[#C6A36B] tracking-wider transition-all"
        >
          <span className="flex items-center gap-2">
            <span>⚙️</span>
            <span>TECHNICAL SPECIFICATIONS &amp; PRIMARY CITATIONS (CLICK TO {showTechnicalSpecs ? 'COLLAPSE' : 'EXPAND'})</span>
          </span>
          <span>{showTechnicalSpecs ? '▲' : '▼'}</span>
        </button>

        {showTechnicalSpecs && (
          <div className="mt-4 p-8 rounded-3xl bg-[#080D16]/95 border border-white/10 space-y-6 animate-fadeIn">
            {/* Vitals Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="font-mono text-[10px] text-[#B6C0CC] uppercase mb-1">PLANNED DAYS</div>
                <div className="font-display text-2xl text-[#F0E8D9]">{artifact.plannedDurationDays}</div>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="font-mono text-[10px] text-[#B6C0CC] uppercase mb-1">ACTUAL DAYS</div>
                <div className="font-display text-2xl text-[#C6A36B]">{artifact.actualDurationDays}</div>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="font-mono text-[10px] text-[#B6C0CC] uppercase mb-1">LAUNCH MASS</div>
                <div className="font-display text-2xl text-[#F0E8D9]">{artifact.massKg.toLocaleString()} kg</div>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="font-mono text-[10px] text-[#B6C0CC] uppercase mb-1">POWER SOURCE</div>
                <div className="font-display text-lg text-[#F0E8D9] uppercase truncate">
                  {artifact.powerSource}
                </div>
              </div>
            </div>

            {/* Coordinates */}
            {formattedCoords && (
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-xs font-mono text-[#B6C0CC]">
                <span className="text-[#C6A36B]">{coordSemanticLabel}:</span> {formattedCoords}
              </div>
            )}

            {/* Payload */}
            {artifact.instrumentPayload && artifact.instrumentPayload.length > 0 && (
              <div className="text-xs font-mono">
                <div className="text-[#B6C0CC] uppercase font-semibold mb-2">INSTRUMENT &amp; SENSOR SUITE:</div>
                <div className="flex flex-wrap gap-2">
                  {artifact.instrumentPayload.map((inst, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-black/40 border border-white/10 text-[11px] text-[#F0E8D9]">
                      {inst}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Citations */}
            {artifact.sourceReferences && (
              <div className="pt-4 border-t border-white/10 text-xs font-mono">
                <div className="text-[#C6A36B] font-medium mb-3">AUTHORITATIVE CITATIONS:</div>
                <div className="space-y-2">
                  {artifact.sourceReferences.map((ref, idx) => {
                    const source = resolveSource(ref, artifact.authoritativeUrl);
                    return (
                      <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                        <span className="text-[#F0E8D9]">{source.title}</span>
                        {source.url && (
                          <a href={source.url} target="_blank" rel="noreferrer" className="text-[#C6A36B] underline ml-2">
                            NASA Archive ↗
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 8. CROSS-FEATURE LINK: SPACE QUIZ */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-[#101A29] to-[#080D16] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] mono text-[#C6A36B] uppercase font-semibold block">
            READY TO TEST YOUR KNOWLEDGE?
          </span>
          <h4 className="font-display text-lg text-[#F0E8D9] font-medium">
            Test what you discovered about space exploration in the Play Hub.
          </h4>
        </div>
        <Link
          to="/play"
          onClick={() => playSignalPing(750)}
          className="px-5 py-2.5 rounded-xl bg-[#C6A36B] text-[#080D16] font-sans text-xs font-bold tracking-wider uppercase flex-shrink-0 hover:bg-[#d8b57d] transition-all"
        >
          PLAY SPACE QUIZ →
        </Link>
      </section>
    </div>
  );
};
