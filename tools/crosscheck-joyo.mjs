// Cross-check against kanji-data (object keyed by kanji).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const res = await fetch('https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json');
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const raw = await res.json();

// grade 1-6 (elementary) + 8 (high school) = joyo. grade 9 = jinmeiyo extra. grade null = non-joyo.
const joyo = Object.entries(raw)
  .filter(([, v]) => v.grade >= 1 && v.grade <= 8)
  .map(([k]) => k);
const unique = [...new Set(joyo)];
console.log(`kanji-data joyo(grade<=8) count=${unique.length}`);

// Compare with our list
const ours = JSON.parse(readFileSync(join(root, 'data', 'joyo.json'), 'utf8'));
const setA = new Set(unique);
const setB = new Set(ours);

const onlyInKanjiData = unique.filter((c) => !setB.has(c));
const onlyInOurs = ours.filter((c) => !setA.has(c));
console.log(`\nonlyInKanjiData (${onlyInKanjiData.length}):`, onlyInKanjiData.join(''));
console.log(`onlyInOurs (${onlyInOurs.length}):`, onlyInOurs.join(''));

// Write the independent list as the canonical 2136 (BMP-only, deduped, sorted by codepoint)
const sorted = unique.sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
writeFileSync(join(root, 'data', 'joyo-2136.json'), JSON.stringify(sorted), 'utf8');
writeFileSync(join(root, 'data', 'joyo-2136.txt'), sorted.join('\n') + '\n', 'utf8');
console.log(`\nwrote joyo-2136.* (from kanji-data, count=${sorted.length})`);

// Also stash the raw kanji-data list for the make-2136 diff step
writeFileSync(join(root, 'data', 'kanji-data-joyo.json'), JSON.stringify(unique), 'utf8');