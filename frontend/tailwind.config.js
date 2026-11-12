export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7F622C',
          dark: '#5C4620',
          ink: '#3E2F14',
          tint: '#F3EEE3',
        },
        lime: {
          DEFAULT: '#CBD300',
          dark: '#A8AE00',
          tint: '#F6F8D6',
        },
        canvas: '#F5F4F1',
        line: '#E4DFD4',
        muted: '#6E6656',
      },
      fontFamily: {
        sans: ['"Public Sans Variable"', '"Public Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
      },
    },
  },
  plugins: [],
};
