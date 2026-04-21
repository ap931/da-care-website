const fs = require('fs');
const content = fs.readFileSync('d:/da.car 1ce fo all/dacare-dashboard.html', 'utf8');

const mapSizeToToken = (match, sizeStr) => {
  const size = parseInt(sizeStr, 10);
  if (size <= 14) return 'font-size: var(--font-caption)';
  if (size <= 16) return 'font-size: var(--font-body-sm)';
  if (size <= 20) return 'font-size: var(--font-body)';
  if (size <= 24) return 'font-size: var(--font-h6)';
  if (size <= 30) return 'font-size: var(--font-h5)';
  if (size <= 36) return 'font-size: var(--font-h4)';
  if (size <= 42) return 'font-size: var(--font-h3)';
  if (size <= 60) return 'font-size: var(--font-h2)';
  return 'font-size: var(--font-h1)';
};

let newContent = content.replace(/font-size:\s*(\d+)px/g, mapSizeToToken);

// Also handle the clamp
newContent = newContent.replace(/font-size:\s*clamp\([^)]+\)/g, 'font-size: var(--font-h1)');

fs.writeFileSync('d:/da.car 1ce fo all/dacare-dashboard.html', newContent);
console.log('Replaced font sizes');
