/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1b3022',
          light: '#2f5233',
        },
        secondary: {
          DEFAULT: '#c5a02d',
        },
        accent: {
          DEFAULT: '#e8f0ea',
          light: '#f4f8f5',
        },
        'bg-off-white': '#fbfbfa',
        'bg-warm': '#fdfbf7',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        lato: ['Lato', 'sans-serif'],
      },
      backgroundImage: {
        'texture': "url('/assets/texture.png')", // optional if texture is present
      }
    },
  },
  plugins: [],
}
