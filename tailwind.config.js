/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark':    '#2D1A00',
        'brand-primary': '#E87A00',
        'brand-warm':    '#F5A623',
        'brand-green':   '#1F5C1F',
        'brand-cream':   '#FFF8EE',
        'brand-text':    '#1A0F00',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, rgba(45,26,0,0.55) 0%, rgba(45,26,0,0.75) 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
}
