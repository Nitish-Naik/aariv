const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/app/dashboard/layout.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/triggers/page.tsx',
  'src/app/dashboard/usage/page.tsx',
  'src/app/dashboard/review/page.tsx',
  'src/app/dashboard/feed/page.tsx',
  'src/app/dashboard/assistant/page.tsx',
  'src/app/dashboard/integrations/page.tsx',
  'src/app/dashboard/settings/page.tsx',
];

const replacements = [
  // Replace the wide 1200px constraint
  ['max-w-[1200px]', 'max-w-[1048px]'],
  // Replace the narrow settings/usage constraints (max-w-2xl is 672px)
  ['max-w-2xl mx-auto', 'max-w-[1048px] mx-auto'],
];

let totalChanges = 0;
const baseDir = __dirname;

for (const relPath of targetFiles) {
  const filePath = path.join(baseDir, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`Missing file: ${filePath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanges = 0;

  for (const [find, replace] of replacements) {
    // Need to handle regex escaping
    const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    const matches = content.match(regex);
    if (matches) {
      fileChanges += matches.length;
      content = content.replace(regex, replace);
    }
  }

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`UPDATED: ${relPath} (${fileChanges} replacements)`);
    totalChanges += fileChanges;
  }
}

console.log(`Done. Total layout replacements: ${totalChanges}`);
