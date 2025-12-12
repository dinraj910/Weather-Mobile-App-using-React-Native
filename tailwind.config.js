/** @type {import('tailwindcss').Config} */
module.exports = {
  // All files that use className go here:
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
