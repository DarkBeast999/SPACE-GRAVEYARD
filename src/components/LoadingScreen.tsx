import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSignalPing } from '../utils/audio';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 500);
    const t2 = setTimeout(() => setStage(2), 1600);
    const t3 = setTimeout(() => setStage(3), 2800);
    const t4 = setTimeout(() => {
      setIsFading(true);
      setTimeout(onComplete, 700);
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const handleSkip = () => {
    playSignalPing(600);
    setIsFading(true);
    setTimeout(onComplete, 300);
  };

  return (
    <AnimatePresence>
      {!isFading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 bg-[#080D16] flex flex-col items-center justify-center p-6 select-none"
        >
          {/* Subtle atmospheric vignette */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#080D16]/70 to-[#080D16] pointer-events-none" />

          <div className="max-w-xl text-center relative z-10 px-4">
            {/* Museum Emissary Emblem */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9 }}
              className="text-[#C6A36B] text-2xl mb-6 tracking-widest"
            >
              ✦
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: stage >= 1 ? 1 : 0, y: stage >= 1 ? 0 : 14 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-4xl sm:text-6xl text-[#F0E8D9] tracking-[0.22em] font-normal mb-3"
            >
              SPACE GRAVEYARD
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 2 ? 1 : 0 }}
              transition={{ duration: 0.9 }}
              className="font-serif italic text-lg sm:text-xl text-[#C6A36B] tracking-wide mb-8 font-light"
            >
              They Never Came Home.
            </motion.p>

            {/* Prologue prose */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 3 ? 1 : 0 }}
              transition={{ duration: 1.1 }}
              className="text-xs sm:text-sm text-[#B6C0CC]/90 leading-relaxed font-light max-w-md mx-auto mb-10"
            >
              Across six decades of exploration, humanity has left 28 landmark robotic pioneers resting across the Moon, Mars, and interstellar deep space. 
              This is their museum.
            </motion.p>

            {/* Subtle loading line */}
            <div className="w-32 h-[1px] bg-white/10 mx-auto relative overflow-hidden mb-6">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                className="w-full h-full bg-gradient-to-r from-transparent via-[#C6A36B] to-transparent"
              />
            </div>

            {/* Skip button */}
            <button
              onClick={handleSkip}
              className="text-[11px] font-sans tracking-[0.25em] uppercase text-[#B6C0CC]/60 hover:text-[#F0E8D9] transition-colors"
            >
              Enter Exhibition ➔
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
