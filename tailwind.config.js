/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:    '#0A0A0B',
        smoke:  '#1A1A1D',
        paper:  '#F7F5F0',
        chalk:  '#E8E4DA',
        muted:  '#8A8A93',
        sun:    '#FFD23F',
        flame:  '#FF4365',
        sky:    '#3DD5FF',
        lime:   '#9EFF00',
      },
      fontFamily: {
        display: ['Manrope', 'Inter Tight', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card:  '0 2px 0 rgba(0,0,0,0.4), 0 18px 40px rgba(0,0,0,0.5)',
        chip:  '0 1px 0 rgba(0,0,0,0.3), 0 6px 16px rgba(0,0,0,0.35)',
        glow:  '0 0 0 4px rgba(255,255,255,0.06), 0 12px 30px rgba(0,0,0,0.5)',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pop: {
          '0%':   { transform: 'scale(0.8)', opacity: '0' },
          '60%':  { transform: 'scale(1.06)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-1.5deg)' },
          '50%':     { transform: 'rotate(1.5deg)' },
        },
      },
      animation: {
        'slide-up': 'slideUp 280ms cubic-bezier(.2,.8,.2,1) both',
        'pop':      'pop 360ms cubic-bezier(.2,1.5,.4,1) both',
        'wiggle':   'wiggle 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
