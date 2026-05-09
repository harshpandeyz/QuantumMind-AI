export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          blue: '#4f9cf9',
          indigo: '#818cf8',
          violet: '#a78bfa',
          pink: '#f472b6',
          cyan: '#22d3ee',
          emerald: '#34d399',
          amber: '#fbbf24',
        }
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.08)',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        shimmer: 'shimmer 1.6s infinite',
        glow: 'glow-pulse 2.5s ease infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%,100%': { boxShadow: '0 0 20px rgba(79,156,249,0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(79,156,249,0.35)' },
        },
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
}
