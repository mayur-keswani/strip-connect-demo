/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode using class strategy
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Add any custom colors here
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /(from|to|text|bg|border|ring|hover:bg|dark:bg|dark:text|dark:border|dark:hover:bg)-(indigo|gray|purple|blue|red|yellow|green)-(50|100|200|300|400|500|600|700|800|900)/,
    }
  ]
}
