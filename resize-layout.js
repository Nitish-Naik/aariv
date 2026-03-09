const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/app/dashboard/triggers/page.tsx',
  'src/app/dashboard/usage/page.tsx',
  'src/app/dashboard/review/page.tsx',
  'src/app/dashboard/feed/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/assistant/page.tsx',
  'src/app/dashboard/integrations/page.tsx',
  'src/app/dashboard/settings/page.tsx',
];

const replacements = [
  ['max-w-[1200px]', 'max-w-[1048px]']
];

let totalChanges = 0;

for (const relPath of targetFiles) {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanges = 0;

  for (const [find, replace] of replacements) {
    // Escape special regex chars
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

console.log(`Done. Total replacements: ${totalChanges}`);
