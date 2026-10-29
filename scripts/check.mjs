// Pseudo-Chinese Jōyō Kanji Checker
// Usage:
//   node scripts/check.mjs "text to check"     # check a string
//   node scripts/check.mjs --file input.txt    # check a file
//   node scripts/check.mjs --validate-data     # validate data/joyo-2136.txt & data/suggest.json
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const joyo = new Set(readFileSync(join(root, 'data', 'joyo-2136.txt'), 'utf8').split('\n').filter(Boolean));
const suggest = JSON.parse(readFileSync(join(root, 'data', 'suggest.json'), 'utf8')).mappings;

function checkString(str) {
  const issues = [];
  for (let i = 0; i < str.length; ) {
    const cp = str.codePointAt(i);
    const ch = str.slice(i, i + (cp > 0xffff ? 2 : 1));
    if (!joyo.has(ch)) {
      const repl = suggest[ch];
      issues.push({ char: ch, pos: i, cp: `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`, repl });
    }
    i += ch.length;
  }
  return issues;
}

function validateData() {
  let ok = true;
  // 1. joyo-2136.txt has 2136 unique BMP chars
  const arr = [...joyo];
  if (arr.length !== 2136) { console.error(`joyo-2136 count=${arr.length}, expected 2136`); ok = false; }
  const dups = arr.filter((v, i) => arr.indexOf(v) !== i);
  if (dups.length) { console.error('joyo-2136 duplicates:', dups); ok = false; }
  const nonBMP = arr.filter((c) => c.codePointAt(0) > 0x9fff || c.codePointAt(0) < 0x4e00);
  if (nonBMP.length) { console.error('joyo-2136 non-BMP:', nonBMP); ok = false; }
  if (ok) console.log('joyo-2136: OK (2136 unique BMP chars)');

  // 2. suggest.json values are jōyō-only
  for (const [k, v] of Object.entries(suggest)) {
    const issues = checkString(v);
    if (issues.length) {
      console.error(`suggest["${k}"]="${v}" has non-jōyō:`, issues.map(i => i.char).join(''));
      ok = false;
    }
    // key should be non-jōyō (or at least not in joyo)
    if (joyo.has(k)) {
      console.warn(`suggest key "${k}" is already jōyō (redundant)`);
    }
  }
  if (ok) console.log('suggest.json: OK (all values jōyō-only)');

  return ok;
}

const args = process.argv.slice(2);
if (args.includes('--validate-data')) {
  const ok = validateData();
  process.exit(ok ? 0 : 1);
}

const fileIdx = args.indexOf('--file');
if (fileIdx >= 0 && args[fileIdx + 1]) {
  const content = readFileSync(args[fileIdx + 1], 'utf8');
  const issues = checkString(content);
  if (issues.length) {
    console.log(`Found ${issues.length} non-jōyō char(s):`);
    for (const i of issues) {
      const hint = i.repl ? ` → suggest: "${i.repl}"` : '';
      console.log(`  ${i.char} (${i.cp}) at pos ${i.pos}${hint}`);
    }
    process.exit(1);
  } else {
    console.log('All characters are jōyō kanji.');
    process.exit(0);
  }
}

if (args.length) {
  const issues = checkString(args.join(' '));
  if (issues.length) {
    console.log(`Found ${issues.length} non-jōyō char(s):`);
    for (const i of issues) {
      const hint = i.repl ? ` → suggest: "${i.repl}"` : '';
      console.log(`  ${i.char} (${i.cp}) at pos ${i.pos}${hint}`);
    }
    process.exit(1);
  } else {
    console.log('All characters are jōyō kanji.');
    process.exit(0);
  }
}

console.log('Usage:');
console.log('  node scripts/check.mjs "text"');
console.log('  node scripts/check.mjs --file input.txt');
console.log('  node scripts/check.mjs --validate-data');
process.exit(1);