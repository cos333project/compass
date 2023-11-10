const postcssFunctions = require('postcss-functions');

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-functions': {
      functions: {
        hexToRgb: function(hex) {
          let r = parseInt(hex.slice(1, 3), 16),
              g = parseInt(hex.slice(3, 5), 16),
              b = parseInt(hex.slice(5, 7), 16);
          return `${r}, ${g}, ${b}`;
        }
      }
    }
  },
}
