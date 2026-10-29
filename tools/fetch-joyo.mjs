// One-shot: pull the joyo kanji list from kanjiapi.dev and normalize it.
// Usage: node tools/fetch-joyo.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const res = await fetch('https://kanjiapi.dev/v1/kanji/joyo');
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const list = await res.json();

const unique = [...new Set(list)];
mkdirSync(join(root, 'data'), { recursive: true });
writeFileSync(join(root, 'data', 'joyo.txt'), unique.join('\n') + '\n', 'utf8');
writeFileSync(join(root, 'data', 'joyo.json'), JSON.stringify(unique, null, 0), 'utf8');

console.log(`count=${unique.length}`);
console.log(`raw=${list.length}`);
const codePoints = unique.map((c) => c.codePointAt(0));
console.log(`allBMP=${codePoints.every((c) => c >= 0x4e00 && c <= 0x9fff)}`);
