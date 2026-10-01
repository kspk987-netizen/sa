const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname);
let html = fs.readFileSync(path.join(root, 'index.modular.html'), 'utf8');

// Inline CSS
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
html = html.replace(/<link rel=["']stylesheet["'] href=["']styles\.css["'] \/>/, '<style>\n' + css + '\n</style>');

// Inline JS files in exact order
const jsFiles = [
  'assets/logo.js',
  'assets/store.js',
  'assets/geo.js',
  'assets/analytics.js',
  'assets/views-public.js',
  'assets/views-admin.js',
  'assets/views-driver.js',
  'assets/views-passenger.js',
  'assets/app.js',
  'assets/knowledge.js',
  'assets/assistant.js'
];

let allJs = '';
for (const f of jsFiles) {
  allJs += '\n/* --- ' + f + ' --- */\n' + fs.readFileSync(path.join(root, f), 'utf8') + '\n';
}

const scriptTagsRegex = /<script src=["']assets\/[^"']+["']><\/script>(\r?\n)*/g;
html = html.replace(scriptTagsRegex, '');
html = html.replace('</body>', '<script>\n' + allJs + '\n</script>\n</body>');

fs.writeFileSync(path.join(root, 'index.html'), html, 'utf8');
console.log('INDEX.HTML INLINED SUCCESSFULLY! Size:', fs.statSync(path.join(root, 'index.html')).size, 'bytes');
