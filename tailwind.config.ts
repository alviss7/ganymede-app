import type { Config } from 'tailwindcss'

import typography from '@tailwindcss/typography'
import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      container: {
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1400px',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        primary: {
          DEFAULT: '#5f5b75',
          50: '#f5f5f7',
          100: '#ebebef',
          200: '#ccccd6',
          300: '#adadbd',
          400: '#8e8ea4',
          500: '#6f6f8b',
          600: '#5f5b75',
          700: '#4f475f',
          800: '#3b3d56',
          900: '#2b2b3d',
        },
      },
    },
  },
  plugins: [tailwindcssAnimate, typography],
} satisfies Config
