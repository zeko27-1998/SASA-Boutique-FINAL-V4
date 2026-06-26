/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pink: {
          50:  '#fef7f9',
          100: '#fde8ef',
          200: '#fbd0e1',
          300: '#f7a8c7',
          400: '#f072a3',
          500: '#e84c8a',
          600: '#d42d6f',
          700: '#b01f58',
          800: '#931c4c',
          900: '#7c1c44',
        },
        baby: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        blush:    '#FFD6E0',
        petal:    '#FFB3C6',
        sky:      '#BAE8FB',
        mist:     '#E8F6FD',
        cream:    '#FFF8FA',
        gold:     '#C9A84C',
        charcoal: '#1a1a1a',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '4.5': '1.125rem',  // fixes top-4.5 in hamburger
        '13':  '3.25rem',
        '18':  '4.5rem',
      },
      animation: {
        'fade-in':      'fadeIn 0.4s ease-out both',
        'slide-up':     'slideUp 0.4s ease-out both',
        'float':        'float 3s ease-in-out infinite',
        'shimmer':      'shimmer 1.5s infinite',
        'bounce-once':  'bounceOnce 0.5s ease',
        'spin-slow':    'spin 2s linear infinite',
        'ping-slow':    'pingSlow 2s ease-in-out infinite',
        'scale-in':     'scaleIn 0.3s ease-out both',
      },
      keyframes: {
        fadeIn:     { '0%': { opacity:0 },                               '100%': { opacity:1 } },
        slideUp:    { '0%': { opacity:0, transform:'translateY(16px)' }, '100%': { opacity:1, transform:'translateY(0)' } },
        float:      { '0%,100%': { transform:'translateY(0)' },          '50%': { transform:'translateY(-7px)' } },
        shimmer:    { '0%': { backgroundPosition:'-200% center' },       '100%': { backgroundPosition:'200% center' } },
        bounceOnce: { '0%':{ transform:'scale(1)' }, '40%':{ transform:'scale(1.3)' }, '70%':{ transform:'scale(0.9)' }, '100%':{ transform:'scale(1)' } },
        pingSlow:   { '0%':{ transform:'scale(1)', opacity:'.6' },       '100%':{ transform:'scale(1.6)', opacity:0 } },
        scaleIn:    { '0%':{ opacity:0, transform:'scale(0.92)' },       '100%':{ opacity:1, transform:'scale(1)' } },
      },
      boxShadow: {
        'pink-sm':  '0 4px 15px rgba(232,76,138,0.25)',
        'pink-md':  '0 6px 25px rgba(232,76,138,0.40)',
        'pink-lg':  '0 10px 40px rgba(232,76,138,0.50)',
        'gold':     '0 4px 20px rgba(201,168,76,0.35)',
        'card':     '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover':'0 8px 32px rgba(232,76,138,0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
