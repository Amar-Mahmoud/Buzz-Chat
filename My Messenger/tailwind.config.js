/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/*.jsx"
  ],
  theme: {
    extend: {
      colors: {
        customGray: '#E9E9E9',
        customGraySearch: '#DDDDDD',
        customBlue: '#007AFF',
      },
    },
  },
  plugins: [],
}
