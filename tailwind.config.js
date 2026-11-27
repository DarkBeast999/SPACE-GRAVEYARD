/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luminous Cosmic Observatory Theme
        'cosmic-ink': '#080B1D',
        'deep-indigo': '#111A35',
        'elevated-blue': '#1B284A',
        'electric-cyan': '#58D9FF',
        'nebula-violet': '#A18BFF',
        'aurora-mint': '#64E5C0',
        'solar-amber': '#FFC66D',
        'coral-rust': '#FF8D7B',
        'warm-ivory': '#F5F0E8',
        'lunar-silver': '#C8D8EA',

        // Backward-compatible preserved aliases
        'near-black': '#080B1D',
        'midnight-navy': '#111A35',
        'deep-slate': '#1B284A',
        'mist-grey': '#C8D8EA',
        'antique-gold': '#FFC66D',
        'muted-blue': '#58D9FF',
        'nebula-lavender': '#A18BFF',
        void: '#080B1D',
        'text-primary': '#F5F0E8',
        'text-ghost': '#C8D8EA',
        'ghost-amber': '#FFC66D',
        'signal-cyan': '#58D9FF',
        'nebula-purple': '#111A35',
        'deep-gold': '#FFC66D',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Cinzel', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Cinzel', 'Georgia', 'serif'],
        sans: ['Inter', 'Space Grotesk', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
        orbitron: ['"Cormorant Garamond"', 'Cinzel', 'Georgia', 'serif'], // maps existing orbitron classes to editorial serif
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
