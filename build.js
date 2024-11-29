const fs = require('fs');
const path = require('path');
const sass = require('sass');  // Importing sass for compilation

// List of JS files to concatenate
const entryFiles = [
  'js/JsonCitySync.js',
  'js/JsonCityEditor.js',
  'js/JsonCityHeader.js',
  'js/Tabs/Tab.js',
  'js/Tabs/Tabs.js',
  'js/Tabs/TabsView.js',
  'js/Tabs/Scroller.js',
  'js/main.js',
];
const outputJSFile = 'js/jsoncity.js';

// List of SASS files to compile
const sassFiles = [
  'scss/style.scss', // Add your SASS files here
];
const outputCSSFile = 'css/style.css'; // Output path for CSS

// Concatenate all JS files
let concatenatedContent = '';

entryFiles.forEach((file) => {
  try {
    const fileContent = fs.readFileSync(path.resolve(__dirname, file), 'utf-8');
    concatenatedContent += fileContent + '\n\n'; // Add some space between files
  } catch (err) {
    console.error(`Error reading file ${file}:`, err);
  }
});

// Compile SASS files to CSS
let compiledCSS = '';
sassFiles.forEach((file) => {
  try {
    const result = sass.renderSync({ file: path.resolve(__dirname, file) });
    compiledCSS += result.css.toString() + '\n\n'; // Add some space between compiled SASS files
  } catch (err) {
    console.error(`Error compiling SASS file ${file}:`, err);
  }
});

// Write the concatenated JS to the output file
fs.mkdirSync(path.dirname(outputJSFile), { recursive: true }); // Ensure output directory exists
fs.writeFileSync(outputJSFile, concatenatedContent, 'utf-8');

// Write the compiled CSS to the output file
fs.mkdirSync(path.dirname(outputCSSFile), { recursive: true }); // Ensure output directory exists
fs.writeFileSync(outputCSSFile, compiledCSS, 'utf-8');

console.log(`Files concatenated successfully into ${outputJSFile}`);
console.log(`SASS compiled successfully into ${outputCSSFile}`);