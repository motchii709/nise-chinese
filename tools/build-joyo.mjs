// Rebuild data/joyo-2136.txt (+ .json) from primary sources and cross-check it.
//  - kanjiapi.dev /v1/kanji/joyo  → 2140 codepoints (2136 + 4 reference forms)
//  - drop reference forms: 𠮟(ref of 叱), 剝(ref of 剥), 塡(ref of 填), 頰(ref of 頬)
//  - keep modern print forms 剥/填/頬 per the official 2010 table
//  - cross-check vs davidluzgouveia/kanji-data grade 1-8 (independent source)
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function fetchKanjiData() {
  const res = await fetch('https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  return [...new Set(Object.entries(raw).filter(([, v]) => v.grade >= 1 && v.grade <= 8).map(([k]) => k))];
}

const refForms = new Set(['𠮟', '剝', '塡', '頰']);
const kanjiapi = await (async () => {
  // allow offline re-runs: reuse a cached copy if present
  const cache = join(root, 'data', 'joyo-kanjiapi.json');
  if (existsSync(cache)) return JSON.parse(readFileSync(cache, 'utf8'));
  const res = await fetch('https://kanjiapi.dev/v1/kanji/joyo');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const list = await res.json();
  writeFileSync(cache, JSON.stringify(list), 'utf8');
  return list;
})();

const clean = [...new Set(kanjiapi.filter((c) => !refForms.has(c) && c.length === 1))]
  .sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
console.log(`kanjiapi ${kanjiapi.length} → canonical ${clean.length}`);

try {
  const kd = await fetchKanjiData();
  const a = new Set(clean), b = new Set(kd);
  const oa = clean.filter((c) => !b.has(c)).join('');
  const ob = kd.filter((c) => !a.has(c)).join('');
  console.log(`diff vs kanji-data(grade1-8, ${kd.length}): onlyInOurs=[${oa}] onlyInKanjiData=[${ob}]`);
  if (oa + ob !== '填頬塡頰') console.warn('WARNING: unexpected diff — inspect before trusting this list');
} catch (e) {
  console.warn(`cross-check skipped: ${e.message}`);
}

writeFileSync(join(root, 'data', 'joyo-2136.txt'), clean.join('\n') + '\n', 'utf8');
writeFileSync(join(root, 'data', 'joyo-2136.json'), JSON.stringify(clean), 'utf8');
console.log('wrote data/joyo-2136.*');