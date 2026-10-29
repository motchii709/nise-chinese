// Embed data/joyo-2136.txt and data/suggest.json into scripts/check.mjs
// between the JOYO/SUGGEST marker lines, keeping check.mjs a single portable file.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const script = join(root, 'scripts', 'check.mjs');
let src = readFileSync(script, 'utf8');

const joyo = readFileSync(join(root, 'data', 'joyo-2136.txt'), 'utf8').split('\n').filter(Boolean);
const { mappings } = JSON.parse(readFileSync(join(root, 'data', 'suggest.json'), 'utf8'));

// Compact the list: groups of 64 kanji joined as one string per entry.
const groups = [];
for (let i = 0; i < joyo.length; i += 64) groups.push(joyo.slice(i, i + 64).join(''));
const joyoLiteral = groups.map((g) => `'${g}'`).join(',\n  ');

const entries = Object.entries(mappings).map(([k, v]) => `  '${k}': '${v}'`).join(',\n');

function replaceSection(text, begin, end, replacement) {
  const re = new RegExp(`(${begin}[\\s\\S]*?${end})`);
  if (!re.test(text)) throw new Error(`marker not found: ${begin}`);
  return text.replace(re, replacement);
}

src = replaceSection(src, '// ===JOYO_BEGIN===', '// ===JOYO_END===',
  `// ===JOYO_BEGIN===\nexport const JOYO = new Set([\n  ${joyoLiteral},\n].join(''));\n// ===JOYO_END===`);

src = replaceSection(src, '// ===SUGGEST_BEGIN===', '// ===SUGGEST_END===',
  `// ===SUGGEST_BEGIN===\nexport const SUGGEST = {\n${entries},\n};\n// ===SUGGEST_END===`);

writeFileSync(script, src, 'utf8');
console.log(`embedded: joyo=${joyo.length} chars, suggest=${entries ? Object.keys(mappings).length : 0} entries`);