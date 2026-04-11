const nextConfig = require("eslint-config-next");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  ...nextConfig,
  // Disables ESLint rules that conflict with Prettier formatting
  prettierConfig,
];
