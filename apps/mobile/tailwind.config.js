/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#5e6ad2",
        "priority-high": "#e5534b",
        "priority-medium": "#d9922a",
        "priority-low": "#27a644",
      },
    },
  },
  plugins: [],
}
