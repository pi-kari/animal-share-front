/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // あなたのクラスで使ってる色名を定義（例）
        primary: '#6366F1',          // indigo-500
        secondary: '#F59E0B',        // amber-500
        'neutral-bg': '#F8FAFC',     // slate-50-ish
        'neutral-dark': '#0F172A',   // slate-900
        'neutral-medium': '#475569', // slate-600
        'neutral-light': '#CBD5E1',  // slate-300
        'accent-blue': '#38BDF8',    // sky-400
        'accent-green': '#34D399',   // emerald-400
      },
    },
  },
  plugins: [],
}
