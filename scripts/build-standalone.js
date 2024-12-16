const fs = require('fs');
const path = require('path');

const script = async () => {
  let content = fs.readFileSync(path.join(__dirname, '../src/paintlib/standalone.html'), 'utf8');
  const scriptContent = fs.readFileSync(path.join(__dirname, '../dist/paintlib.js'), 'utf8');
  content = content.replace('{{SCRIPT_CONTENT}}', scriptContent);

  fs.writeFileSync(path.join(__dirname, '../dist/standalone.html'), content);
};
script().catch(console.error);
