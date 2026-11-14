const fs = require('fs');
const lines = fs.readFileSync('c:\\Project\\Schematrix\\schematrix-main\\components\\offices\\GovernmentOfficeLocator.tsx', 'utf8').split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div[^>]*>/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  const oldDepth = depth;
  depth += opens - closes;
  if (opens > 0 || closes > 0) {
    console.log((i+1) + ': d=' + oldDepth + '->' + depth + ' o=' + opens + ' c=' + closes + ' | ' + line.trim().substring(0, 70));
  }
}
console.log('Final depth:', depth);