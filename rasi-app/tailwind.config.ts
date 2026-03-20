import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a5f',
        secondary: '#2d5a9e',
        accent: '#4a7fd4',
        managing: '#1e3a5f',
        core: '#2d5a9e',
        supporting: '#3b6cb5',
        'rasi-r': '#dc2626',
        'rasi-a': '#d97706',
        'rasi-s': '#2563eb',
        'rasi-i': '#6b7280',
        gate: '#f59e0b',
        decision: '#8b5cf6',
        surface: '#ffffff',
        'text-muted': '#64748b',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundColor: {
        app: '#f8fafc',
      },
    },
  },
  plugins: [],
}
export default config
