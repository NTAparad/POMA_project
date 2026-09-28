/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 50: '#f4f5f8', 100: '#e6e8ef', 300: '#a9afc4', 500: '#5b6484', 700: '#333c5c', 900: '#1b2138' },
        signal: { DEFAULT: '#e8683c', soft: '#fdece5' },
        todo: '#8b93ad', doing: '#2f6fd0', review: '#b07a1e', done: '#2c8a5a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
