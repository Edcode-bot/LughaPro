import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#171717',
        'electric-amber': '#FFBF00',
        forest: '#1a4731',
        jade: '#2d6a4f',
        gold: '#FFBF00',
        cream: '#fdf6e3',
        'off-white': '#f8f4ef',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Arial', 'Helvetica', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
    },
  },
}

export default config
