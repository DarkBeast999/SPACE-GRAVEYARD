/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'near-black': '#080D16',
        'midnight-navy': '#101A29',
        'deep-slate': '#26374C',
        'warm-ivory': '#F0E8D9',
        'mist-grey': '#B6C0CC',
        'antique-gold': '#C6A36B',
        'muted-blue': '#789CB8',
        'nebula-lavender': '#A896C5',
        // Harmonized aliases for backward-compatibility with existing code
        void: '#080D16',
        'text-primary': '#F0E8D9',
        'text-ghost': '#B6C0CC',
        'ghost-amber': '#C6A36B',
        'signal-cyan': '#789CB8',
        'nebula-purple': '#101A29',
        'deep-gold': '#C6A36B',
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
