/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 使用类切换，而不是媒体查询
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      animation: {
        'slide-in-down': 'slideInDown 0.3s ease-out forwards',
        'slide-out-up': 'slideOutUp 0.3s ease-in forwards',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
        'bounce-subtle': 'bounceSubtle 1s infinite',
        'fadein': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        slideInDown: {
          '0%': { transform: 'translateY(-10%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideOutUp: {
          '0%': { transform: 'translateY(0)', opacity: 1 },
          '100%': { transform: 'translateY(-10%)', opacity: 0 },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.85, transform: 'scale(1.03)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
} 