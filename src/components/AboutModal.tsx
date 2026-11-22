import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl bg-[#080D16] border border-[#C6A36B]/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-6">
          <div>
            <span className="text-[10px] mono text-[#C6A36B] uppercase tracking-widest font-semibold block mb-1">
              EDUCATIONAL INITIATIVE // ARCHIVAL STATEMENT
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-[#F0E8D9] font-medium">
              About SPACE GRAVEYARD
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full border border-white/15 text-[#B6C0CC] hover:text-white hover:border-white/40 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Narrative & Purpose */}
        <div className="space-y-4 text-xs sm:text-sm text-[#B6C0CC] leading-relaxed font-light">
          <p>
            <strong>SPACE GRAVEYARD — They Never Came Home</strong> is an interactive digital space exploration museum designed for students, educators, and space enthusiasts around the world.
          </p>
          <p>
            The project documents the remarkable human-made spacecraft, rovers, and landers that humanity has left behind across the Solar System—monuments of silicon and titanium anchored into the dust of distant worlds.
          </p>

          <div className="p-4 rounded-xl bg-[#101A29] border border-[#C6A36B]/30 text-xs space-y-2">
            <div className="text-[#C6A36B] font-mono font-semibold">OUR CORE DESIGN PHILOSOPHY:</div>
            <ul className="list-disc pl-4 space-y-1 text-[#F0E8D9]/90">
              <li><strong>Curiosity first:</strong> Interactive 3D planetary exploration for everyone, without needing a scientific degree.</li>
              <li><strong>Authentic data:</strong> Verified ephemerides, landing coordinates, and historical records from NASA NSSDCA, JPL Horizons, and UNOOSA.</li>
              <li><strong>Storytelling with honesty:</strong> Clearly disclosing creative reconstructions while celebrating genuine discoveries.</li>
            </ul>
          </div>

          <p>
            Developed independently as a NASA Space Apps Challenge initiative. All archival imagery courtesy of NASA, JPL-Caltech, ESA, and CNSA.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center text-xs font-mono text-[#B6C0CC]">
          <span>VERIFIED CATALOG: 28 MONUMENTS</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#C6A36B] text-[#080D16] font-bold uppercase tracking-wider hover:bg-[#d8b57d] transition-all"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
