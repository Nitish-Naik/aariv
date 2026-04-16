const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let totalChanges = 0;

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (!filePath.endsWith('.tsx')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Find lucide-react imports
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g;
  let match;
  let icons = new Set();
  
  while ((match = importRegex.exec(content)) !== null) {
    const importStr = match[1];
    importStr.split(',').forEach(item => {
      // Handle aliases like "Menu as MenuIcon"
      let name = item.trim().split(/\s+as\s+/)[0].trim();
      if (name) icons.add(name);
      
      let alias = item.trim().split(/\s+as\s+/)[1]?.trim();
      if (alias) icons.add(alias);
    });
  }

  if (icons.size === 0) return;

  // For each icon, find its usages
  for (const icon of icons) {
    // Regex matches <IconName ... > or <IconName/> or <IconName>
    // but not <IconNameSomethingElse
    // e.g. `<Check ... >` but not `<Checkbox ... >`
    const tagRegex = new RegExp(`(<${icon})(?=[\\s/>])([^>]*>)`, 'g');
    
    content = content.replace(tagRegex, (fullMatch, openTag, rest) => {
      if (fullMatch.includes('strokeWidth=')) return fullMatch;
      
      if (rest.startsWith('/>') || rest.match(/^\s*\/>/)) {
        return `${openTag} strokeWidth={1.5} ${rest.trim()}`;
      } else if (rest.startsWith('>')) {
        return `${openTag} strokeWidth={1.5}>`;
      } else {
        return `${openTag} strokeWidth={1.5}${rest}`;
      }
    });
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated icons in ${filePath}`);
    totalChanges++;
  }
});

console.log(`\nDone. Updated ${totalChanges} files.`);
