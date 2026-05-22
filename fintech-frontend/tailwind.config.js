/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep ink/slate base with a confident teal-green money accent.
        ink: {
          900: '#0b1120', 800: '#0f172a', 700: '#1e293b', 600: '#334155',
        },
        brand: {
          50: '#ecfdf5', 100: '#d1fae5', 300: '#6ee7b7', 400: '#34d399',
          500: '#10b981', 600: '#059669', 700: '#047857',
        },
        accent: { 400: '#38bdf8', 500: '#0ea5e9' },
      },
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)',
        glow: '0 0 0 1px rgba(16,185,129,0.2), 0 8px 30px rgba(16,185,129,0.15)',
      },
    },
  },
  plugins: [],
}
