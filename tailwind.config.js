/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        heartBeat: {
          '0%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.3)' },
          '30%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.2)' },
          '60%': { transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        scaleIn: 'scaleIn 0.3s ease-out',
        heartBeat: 'heartBeat 0.6s ease-in-out',
        slideDown: 'slideDown 0.3s ease-out',
      },
    },
  },
  plugins: [],
}