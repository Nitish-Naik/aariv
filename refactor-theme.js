const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'refactor-log.txt');
fs.writeFileSync(logFile, 'Refactor started\n');
function log(msg) { fs.appendFileSync(logFile, msg + '\n'); }
const replacements = [
  // Backgrounds
  ['bg-[var(--bg-deep)]', 'bg-black'],
  ['bg-[var(--bg-surface)]', 'bg-black'],
  ['bg-[var(--bg-elevated)]', 'bg-neutral-900'],
  ['bg-[var(--bg-base)]', 'bg-black'],
  ['bg-[var(--overlay)]', 'bg-neutral-900'],
  ['bg-[var(--accent-soft)]', 'bg-white/5'],
  ['bg-[var(--accent)]', 'bg-white'],
  ['bg-[var(--tab-bg)]', 'bg-neutral-900'],
  ['bg-[var(--tab-active)]', 'bg-white/10'],
  ['bg-[var(--pill-active-bg)]', 'bg-white'],
  ['bg-[var(--pill-bg)]', 'bg-neutral-900'],

  // Text 
  ['text-[var(--text-primary)]', 'text-white'],
  ['text-[var(--text-secondary)]', 'text-neutral-400'],
  ['text-[var(--text-muted)]', 'text-neutral-500'],
  ['text-[var(--accent)]', 'text-white'],
  ['text-[var(--pill-active-text)]', 'text-black'],

  // Borders
  ['border-[var(--border)]', 'border-white/10'],
  ['border-[var(--border-strong)]', 'border-white/20'],
  ['border-[var(--accent)]', 'border-white/30'],

  // Misc 
  ['hover:border-[var(--accent)]', 'hover:border-white/30'],
  ['focus:border-[var(--accent)]', 'focus:border-white/30'],
  ['focus:ring-[var(--text-secondary)]', 'focus:ring-white/20'],
  ['group-hover:text-[var(--accent)]', 'group-hover:text-white'],
  ['group-hover:text-[var(--text-primary)]', 'group-hover:text-white'],
  ['hover:text-[var(--text-primary)]', 'hover:text-white'],
  ['hover:text-[var(--text-secondary)]', 'hover:text-neutral-300'],
  ['hover:border-[var(--border-strong)]', 'hover:border-white/20'],
  ['hover:bg-[var(--bg-elevated)]', 'hover:bg-white/5'],
  ['placeholder-[var(--text-muted)]', 'placeholder-neutral-600'],
  ['focus:border-[var(--text-secondary)]', 'focus:border-white/20'],
  ['group-hover:bg-[rgba(255,255,255,0.1)]', 'group-hover:bg-white/10'],

  // Deep cleanup: common rgba patterns used as alternatives to var
  // These already look fine for a dark theme but let's normalize some
  ['bg-[rgba(255,255,255,0.02)]', 'bg-white/[0.02]'],
  ['bg-[rgba(255,255,255,0.03)]', 'bg-white/[0.03]'],
  ['bg-[rgba(255,255,255,0.04)]', 'bg-white/[0.04]'],
  ['bg-[rgba(255,255,255,0.05)]', 'bg-white/5'],
  ['bg-[rgba(255,255,255,0.06)]', 'bg-white/[0.06]'],
  ['bg-[rgba(255,255,255,0.08)]', 'bg-white/[0.08]'],
  ['border-[rgba(255,255,255,0.02)]', 'border-white/[0.02]'],
  ['border-[rgba(255,255,255,0.03)]', 'border-white/[0.03]'],
  ['border-[rgba(255,255,255,0.05)]', 'border-white/5'],
  ['border-[rgba(255,255,255,0.06)]', 'border-white/[0.06]'],
  ['border-[rgba(255,255,255,0.08)]', 'border-white/[0.08]'],
  ['hover:bg-[rgba(255,255,255,0.03)]', 'hover:bg-white/[0.03]'],
  ['hover:bg-[rgba(255,255,255,0.04)]', 'hover:bg-white/[0.04]'],
  ['hover:bg-[rgba(255,255,255,0.08)]', 'hover:bg-white/[0.08]'],
  ['hover:border-[rgba(255,255,255,0.1)]', 'hover:border-white/10'],
  ['hover:border-[rgba(255,255,255,0.08)]', 'hover:border-white/[0.08]'],

  // Additional known patterns 
  ['bg-[var(--bg-deep)]/80', 'bg-black/80'],
  ['bg-[var(--bg-base)]/80', 'bg-black/80'],
  ['bg-[var(--accent)]/10', 'bg-white/10'],
  ['text-[var(--accent)]/5', 'text-white/5'],
  ['bg-[currentColor]/10', 'bg-current/10'],
  // Custom patterns found via grep
  ['divide-[var(--border)]', 'divide-white/10'],
  ['hover:border-[var(--text-muted)]', 'hover:border-neutral-500'],
  ['bg-[var(--border)]', 'bg-white/10'],
  ['border-[var(--bg-surface)]', 'border-black'],
  ['focus:ring-[var(--accent)]', 'focus:ring-white'],
  ['stopColor="var(--accent)"', 'stopColor="white"'],
  ['shadow-[0_0_30px_var(--accent-soft)]', 'shadow-[0_0_30px_rgba(255,255,255,0.05)]'],
  ['var(--accent)', 'white'],
  ['var(--bg-deep)', 'black'],
  ['bg-[var(--text-primary)]', 'bg-white'],
  ['bg-[var(--text-muted)]', 'bg-neutral-500'],
  ['from-[var(--bg-elevated)] to-[var(--bg-deep)]', 'from-neutral-900 to-black'],
  ['border-[var(--accent)]', 'border-white'],
  ['border-[var(--pill-active-bg)]', 'border-white'],
  ['var(--text-primary)', 'white'],
  ['text-[var(--bg-deep)]', 'text-black'],
  ['from-[var(--bg-surface)]', 'from-black'],
  ['via-[var(--bg-surface)]', 'via-black'],
  ['from-[var(--border)]', 'from-white/10'],
  ['via-[var(--border)]', 'via-white/10'],
  ['var(--text-muted)', '#737373'],

  // Rounded styles — normalize
  ['rounded-2xl', 'rounded-xl'],
];

// Files to process
const targetFiles = [
  'src/app/dashboard/layout.tsx',
  'src/app/dashboard/triggers/page.tsx',
  'src/app/dashboard/usage/page.tsx',
  'src/app/dashboard/review/page.tsx',
  'src/app/dashboard/feed/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/assistant/page.tsx',
  'src/app/dashboard/integrations/page.tsx',
  'src/app/dashboard/settings/page.tsx',
  'src/components/Sidebar.tsx',
  'src/components/DataCard.tsx',
  'src/components/StatusLogCard.tsx',
  'src/components/FeedbackWidget.tsx',
  'src/components/DetailedLogEntry.tsx',
];

const baseDir = __dirname;
let totalChanges = 0;

for (const relPath of targetFiles) {
  const filePath = path.join(baseDir, relPath);
  if (!fs.existsSync(filePath)) {
    log(`SKIP (not found): ${relPath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanges = 0;

  for (const [find, replace] of replacements) {
    // Escape special regex chars in the find string
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
    log(`UPDATED: ${relPath} (${fileChanges} replacements)`);
    totalChanges += fileChanges;
  } else {
    log(`NO CHANGES: ${relPath}`);
  }
}

log(`\nDone. Total replacements: ${totalChanges}`);
