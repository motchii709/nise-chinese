// Build the canonical 2136-character joyo list.
//
// Source: kanjiapi.dev /v1/kanji/joyo returns 2140 codepoints = the official 2136
// PLUS the 4 parenthesized reference forms (いわゆる康熙字典体) of the 2010 table:
//   𠮟(ref of 叱), 剝(ref of 剥), 塡(ref of 填), 頰(ref of 頬)
// We keep the modern print forms (剥, 填, 叱, 頬) and drop the reference forms.
//
// Cross-checked against davidluzgouveia/kanji-data (grade 1-8 = 2136 chars).
// kanji-data picks the old forms 塡/頰 for two of those pairs; we pick the print
// forms 填/頬 per the official table. Diff vs kanji-data: exactly those 2 pairs.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const list = JSON.parse(readFileSync(join(root, 'data', 'joyo.json'), 'utf8'));

const referenceForms = new Set(['𠮟', '剝', '塡', '頰']);
const clean = list.filter((c) => !referenceForms.has(c) && c.length === 1);

const sorted = [...new Set(clean)].sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
console.log(`canonical count: ${sorted.length}`);

// Cross-check vs kanji-data grade 1-8 (array of kanji strings)
const kd = JSON.parse(readFileSync(join(root, 'data', 'kanji-data-joyo.json'), 'utf8'));
const a = new Set(sorted), b = new Set(kd);
console.log('onlyInOurs:', sorted.filter((c) => !b.has(c)).join(''));
console.log('onlyInKanjiData:', kd.filter((c) => !a.has(c)).join(''));

writeFileSync(join(root, 'data', 'joyo-2136.txt'), sorted.join('\n') + '\n', 'utf8');
writeFileSync(join(root, 'data', 'joyo-2136.json'), JSON.stringify(sorted), 'utf8');
console.log('wrote joyo-2136.*');