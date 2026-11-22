import React, { useState, useRef, useEffect } from 'react';

interface Hotspot {
  xPercent: number; // 0 to 100% across image width
  yPercent: number; // 0 to 100% across image height
  title: string;
  description: string;
}

interface PanoramaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  imageSrc: string;
  hotspots?: Hotspot[];
}

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  imageSrc,
  hotspots = [],
}) => {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (containerRef.current?.offsetLeft || 0);
    scrollLeft.current = containerRef.current?.scrollLeft || 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5;
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl text-[#F0E8D9] animate-fadeIn select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#080D16]/90">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C6A36B] animate-pulse"></span>
            <h2 className="font-display text-xl font-medium tracking-wide text-[#F0E8D9]">
              {title}
            </h2>
          </div>
          <p className="text-xs font-serif italic text-[#C6A36B] mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-xs font-mono text-[#B6C0CC]/70">
            DRAG TO PAN • CLICK HIGHLIGHTS TO EXAMINE
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full border border-[#C6A36B]/50 hover:border-[#C6A36B] bg-[#C6A36B]/15 hover:bg-[#C6A36B] text-[#F0E8D9] hover:text-[#080D16] transition-all font-mono text-xs font-semibold tracking-wider"
          >
            ✕ EXIT PANORAMA
          </button>
        </div>
      </div>

      {/* Panorama Viewing Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-1 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing relative flex items-center bg-[#05080E]"
      >
        <div className="relative inline-block h-full min-w-[2400px]">
          <img
            src={imageSrc}
            alt={title}
            className="h-full w-auto max-w-none object-cover pointer-events-none"
          />

          {/* Hotspot Markers */}
          {hotspots.map((h, i) => (
            <div
              key={i}
              style={{ left: `${h.xPercent}%`, top: `${h.yPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                setActiveHotspot(h);
              }}
            >
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-[#C6A36B] opacity-75"></span>
                <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-[#C6A36B] text-[#080D16] text-[10px] font-bold shadow-lg">
                  {i + 1}
                </span>
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-2.5 py-1 rounded bg-[#080D16]/95 border border-[#C6A36B]/60 text-[11px] whitespace-nowrap shadow-xl font-sans">
                {h.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Hotspot Detail Overlay */}
      {activeHotspot && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-lg w-[90%] bg-[#080D16]/95 border border-[#C6A36B] p-5 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] mono text-[#C6A36B] uppercase tracking-wider block mb-1">
                EXAMINATION TARGET //
              </span>
              <h3 className="font-display text-lg font-medium text-[#F0E8D9]">
                {activeHotspot.title}
              </h3>
              <p className="text-xs text-[#B6C0CC] leading-relaxed mt-1 font-light">
                {activeHotspot.description}
              </p>
            </div>
            <button
              onClick={() => setActiveHotspot(null)}
              className="text-xs text-[#B6C0CC] hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="py-2.5 px-6 border-t border-white/10 bg-[#080D16]/90 flex items-center justify-between text-[11px] mono text-[#B6C0CC]">
        <span>CLICK AND DRAG HORIZONTALLY TO EXPLORE THE LANDSCAPE</span>
        <span className="text-[#C6A36B]">NASA / JPL ARCHIVAL SCIENTIFIC MOSAIC</span>
      </div>
    </div>
  );
};
