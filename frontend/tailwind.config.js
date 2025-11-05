/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sage Muted Palette - Color EXACTO de la referencia
        'sage-muted': {
          50: '#F5F5F3',
          100: '#E8E7E3',
          200: '#D1CFC8',
          300: '#b8c4a9',  // EXACTO de la referencia CSS
          DEFAULT: '#b8c4a9',
          400: '#8B8878',
          500: '#767465',
        },
        // Minimalista Sage Palette - LEGACY (mantener por compatibilidad)
        sage: {
          50: '#F5F5F3',
          100: '#EAEAE5',
          200: '#D5D6CD',
          300: '#B8C4A9',
          400: '#ADBBA0',
          500: '#9CAA8E',
          600: '#8A9B7E',
          700: '#6B7961',
          800: '#4A5240',
          900: '#2D3E00',
        },
        // Solo blanco, negro, gris - MINIMALISMO PURO
        minimal: {
          white: '#FFFFFF',
          black: '#000000',
          gray: '#6B6B6B',
          lightgray: '#E5E5E5',
        },
        // Olive Green & Natural Tones Color Palette
        olive: {
          50: '#F8FAF5',
          100: '#EDF2E4',
          200: '#D9E5C8',
          300: '#C5D8AC',
          400: '#B1CB90',
          500: '#8FA84E',
          600: '#6B7F39',
          700: '#556631',
          800: '#3F4C25',
          900: '#2D3319',
        },
        natural: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        // UI colors
        background: '#b8c4a9',
        foreground: '#000000',
        card: '#F5F5F3',
        'card-foreground': '#1A1A1A',
        primary: {
          DEFAULT: '#2D3E00',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#8A9B7E',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#B8A588',
          foreground: '#1A1A1A',
        },
        muted: {
          DEFAULT: '#EAEAE5',
          foreground: '#4A4A42',
        },
        border: 'rgba(26, 26, 26, 0.08)',
        input: 'rgba(26, 26, 26, 0.08)',
        ring: '#2D3E00',
      },
      borderRadius: {
        lg: '0.25rem',
        md: '0.25rem',
        sm: '0.125rem',
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        'serif-alt': ['Crimson Pro', 'Georgia', 'serif'],
        'display': ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'minimal': '0 1px 3px rgba(0,0,0,0.08)',
        'none': 'none',
      },
      letterSpacing: {
        'luxury': '0.15em',
        'ultra': '0.3em',
      },
      lineHeight: {
        'relaxed-plus': '1.9',
        'loose-plus': '2.1',
      },
    },
  },
  plugins: [],
};
