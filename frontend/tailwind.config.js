export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['"Exo 2"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace']
      },
      colors: {
        quantum: {
          bg: 'var(--bg-primary)',
          panel: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
          cyan: 'var(--accent-primary)',
          violet: 'var(--accent-secondary)'
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
}

