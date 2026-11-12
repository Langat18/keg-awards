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
        canvas: '#F2F3EF',
        line: '#DCDDD5',
        muted: '#6B6A5E',
      },
      fontFamily: {
        sans: ['"Public Sans Variable"', '"Public Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
      },
    },
  },
  plugins: [],
};
