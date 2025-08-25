module.exports = {
  // Run ESLint on TypeScript and JavaScript files
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // Run Prettier on JSON, CSS, and Markdown files
  '*.{json,css,scss,md}': [
    'prettier --write',
  ],
  
  // Type check TypeScript files
  '*.{ts,tsx}': [
    () => 'tsc --noEmit',
  ],
};
