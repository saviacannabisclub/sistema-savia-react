/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        verde: {
          DEFAULT: '#2D5A27',
          oscuro: '#1e3d1a',
          medio: '#3a7232',
          claro: '#e8f0e6',
        },
        crema: {
          DEFAULT: '#E8DCC8',
          oscuro: '#d4c8b0',
          suave: '#f5f0e8',
        },
        ambar: {
          DEFAULT: '#b07d2a',
          claro: '#fdf3dc',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}