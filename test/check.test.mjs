// Tests for scripts/check.mjs (single-file, embedded data).
// Run: node --test test/check.test.mjs
import { test } from 'node:test';
import { strictEqual, deepStrictEqual, ok } from 'node:assert';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { JOYO, SUGGEST, checkString } from '../scripts/check.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('embedded JOYO set has exactly 2136 unique BMP kanji', () => {
  strictEqual(JOYO.size, 2136);
  for (const c of JOYO) {
    const cp = c.codePointAt(0);
    ok(cp >= 0x4e00 && cp <= 0x9fff, `${c} not in BMP`);
  }
});

test('pure joyo string passes', () => {
  deepStrictEqual(checkString('我是学生'), []);
  deepStrictEqual(checkString('今日天候如何'), []);
  deepStrictEqual(checkString('我通学'), []);
});

test('hiragana is flagged', () => {
  const issues = checkString('私は学校に行きます');
  ok(issues.some((i) => i.char === 'は'));
  ok(issues.some((i) => i.char === 'に'));
  ok(issues.some((i) => i.char === 'ま'));
  ok(issues.some((i) => i.char === 'す'));
  strictEqual(issues.length, 5); // は, に, き, ま, す (私/学/校/行 are jōyō)
});

test('katakana is flagged', () => {
  ok(checkString('コード修正').some((i) => i.char === 'コ'));
});

test('non-joyo kanji is flagged', () => {
  ok(checkString('此代碼修正').some((i) => i.char === '此'));
  ok(checkString('此代碼修正').some((i) => i.char === '碼'));
});

test('punctuation is flagged', () => {
  ok(checkString('我通学、明日会合。').some((i) => i.char === '、'));
  ok(checkString('我通学、明日会合。').some((i) => i.char === '。'));
});

test('all suggest values are joyo-only and keys are non-joyo', () => {
  for (const [k, v] of Object.entries(SUGGEST)) {
    const issues = checkString(v);
    strictEqual(issues.length, 0, `SUGGEST["${k}"]="${v}" has non-joyo: ${issues.map((i) => i.char).join('')}`);
    ok(!JOYO.has(k), `SUGGEST key "${k}" is already joyo (redundant)`);
  }
});

test('references/self-check.md substitution table matches SUGGEST', () => {
  const md = readFileSync(join(root, 'references', 'self-check.md'), 'utf8');
  const rows = [...md.matchAll(/^\| (\S) \| (\S+) \|$/gm)];
  ok(rows.length >= 80, `self-check table rows: ${rows.length}`);
  for (const [, k, v] of rows) {
    ok(k in SUGGEST, `self-check row "${k}" missing from SUGGEST`);
    strictEqual(SUGGEST[k], v, `self-check row "${k}" -> "${v}" != SUGGEST["${k}"]="${SUGGEST[k]}"`);
  }
  strictEqual(rows.length, Object.keys(SUGGEST).length, 'self-check table must list every SUGGEST entry');
});

test('references/joyo-2136.md contains exactly the 2136 embedded kanji', () => {
  const md = readFileSync(join(root, 'references', 'joyo-2136.md'), 'utf8');
  const listLines = md.split('\n').filter((l) => /^[\u4e00-\u9faf]{20,}$/.test(l)).join('');
  const chars = [...new Set(listLines)];
  strictEqual(chars.length, 2136);
  const set = new Set(chars);
  for (const c of JOYO) ok(set.has(c), `${c} missing from references/joyo-2136.md`);
});
