const fs = require('fs');
const path = require('path');
const sass = require('sass');  // Importing sass for compilation
const postcss = require('postcss');  // Importing postcss
const cssnano = require('cssnano');  // Importing cssnano for CSS minification

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

// Suppress deprecation warnings
const originalStderrWrite = process.stderr.write;
process.stderr.write = (msg) => {
  if (!msg.includes('Deprecation Warning')) {
    originalStderrWrite.call(process.stderr, msg);
  }
};

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
    const result = sass.renderSync({
      file: path.resolve(__dirname, file),
      outputStyle: 'expanded',  // Use expanded style for better readability during development
    });
    compiledCSS += result.css.toString() + '\n\n'; // Add some space between compiled SASS files
  } catch (err) {
    console.error(`Error compiling SASS file ${file}:`, err);
  }
});

// Minify CSS only if we're in production
if (process.env.NODE_ENV === 'production') {
  // Use PostCSS to process and minify CSS with cssnano
  postcss([cssnano])  // Apply cssnano plugin
    .process(compiledCSS, { from: undefined })  // Process the CSS without specifying an input file (since we're using a string)
    .then((result) => {
      // Write the concatenated JS to the output file
      fs.mkdirSync(path.dirname(outputJSFile), { recursive: true });
      fs.writeFileSync(outputJSFile, concatenatedContent, 'utf-8');

      // Write the minified CSS to the output file
      fs.mkdirSync(path.dirname(outputCSSFile), { recursive: true });
      fs.writeFileSync(outputCSSFile, result.css, 'utf-8');

      console.log(`Files concatenated successfully into ${outputJSFile}`);
      console.log(`SASS compiled and minified successfully into ${outputCSSFile}`);
    }).catch((err) => {
      console.error(`Error minifying CSS:`, err);
    });
} else {
  // Write un-minified CSS during development
  fs.mkdirSync(path.dirname(outputJSFile), { recursive: true });
  fs.writeFileSync(outputJSFile, concatenatedContent, 'utf-8');

  fs.mkdirSync(path.dirname(outputCSSFile), { recursive: true });
  fs.writeFileSync(outputCSSFile, compiledCSS, 'utf-8');

  console.log(`Files concatenated successfully into ${outputJSFile}`);
  console.log(`SASS compiled successfully into ${outputCSSFile}`);
}
