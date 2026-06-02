module.exports = {
  content: [
    "./*.html",
    "./**/*.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Outfit", "sans-serif"]
      },
      colors: {
        brand: {
          primary: "#1c3d33",
          light: "#f7f6f2",
          accent: "#d96c4a",
          accentHover: "#bd5b3d",
          surface: "#ffffff",
          textDark: "#2c332f",
          textMuted: "#647069",
          border: "#e2e6e4"
        }
      }
    }
  },
  plugins: []
};
