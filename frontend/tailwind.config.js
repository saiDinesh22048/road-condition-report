/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional color palette
        primary: {
          50: '#f0f4ff',
          100: '#e0e8ff',
          200: '#c7d5fe',
          300: '#a4b8fc',
          400: '#8093f8',
          500: '#5c6cf2',
          600: '#4a4ee6',
          700: '#3d3dcc',
          800: '#3434a5',
          900: '#2f3282',
          950: '#1e1e4c',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
