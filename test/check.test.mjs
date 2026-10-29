// Tests for scripts/check.mjs
// Run: node --test test/
import { test } from 'node:test';
import { strictEqual, deepStrictEqual, ok } from 'node:assert';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const joyo = new Set(
  readFileSync(join(root, 'data', 'joyo-2136.txt'), 'utf8').split('\n').filter(Boolean)
);
const { mappings } = JSON.parse(readFileSync(join(root, 'data', 'suggest.json'), 'utf8'));

function checkString(str) {
  const issues = [];
  for (let i = 0; i < str.length;) {
    const cp = str.codePointAt(i);
    const ch = str.slice(i, i + (cp > 0xffff ? 2 : 1));
    if (!joyo.has(ch)) issues.push({ char: ch, pos: i });
    i += ch.length;
  }
  return issues;
}

test('joyo-2136.txt has exactly 2136 unique BMP kanji', () => {
  const arr = readFileSync(join(root, 'data', 'joyo-2136.txt'), 'utf8').split('\n').filter(Boolean);
  strictEqual(arr.length, 2136);
  strictEqual(new Set(arr).size, 2136);
  for (const c of arr) {
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

test('ascii is flagged', () => {
  ok(checkString('此代碼修正').some((i) => i.char === '碼'));
});

test('punctuation is flagged', () => {
  ok(checkString('我通学、明日会合。').some((i) => i.char === '、'));
  ok(checkString('我通学、明日会合。').some((i) => i.char === '。'));
});

test('all suggest values are joyo-only', () => {
  for (const [k, v] of Object.entries(mappings)) {
    const issues = checkString(v);
    strictEqual(issues.length, 0, `suggest["${k}"]="${v}" has non-joyo: ${issues.map((i) => i.char).join('')}`);
    ok(!joyo.has(k), `suggest key "${k}" is already joyo (redundant)`);
  }
});
