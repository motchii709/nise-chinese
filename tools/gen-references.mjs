// Generate references/joyo-2136.md (manual lookup list) and the substitution
// table in references/self-check.md from the same data as scripts/check.mjs,
// so the no-tool fallback can never drift from the machine checker.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const joyo = readFileSync(join(root, 'data', 'joyo-2136.txt'), 'utf8').split('\n').filter(Boolean);
const { mappings } = JSON.parse(readFileSync(join(root, 'data', 'suggest.json'), 'utf8'));

// --- joyo-2136.md: 48 chars per line, 16 lines per block of 768 with codepoint range headers
mkdirSync(join(root, 'references'), { recursive: true });
const lines = [];
lines.push('# 常用漢字一覧(2136字・2010年告示)');
lines.push('');
lines.push('スクリプトが使えない環境での目視照合用。この一覧にある漢字のみ使用可(記号・絵文字はここでは扱わない)。');
lines.push('ブロックの見出しは Unicode のコードポイント範囲。');
lines.push('');
for (let i = 0; i < joyo.length; i += 48) {
  const block = joyo.slice(i, i + 48);
  if (i % 768 === 0) {
    const startCp = `U+${block[0].codePointAt(0).toString(16).toUpperCase()}`;
    lines.push('');
    lines.push(`## ${i + 1}〜${Math.min(i + 768, joyo.length)} (${startCp}〜)`);
    lines.push('');
  }
  lines.push(block.join(''));
}
lines.push('');
writeFileSync(join(root, 'references', 'joyo-2136.md'), lines.join('\n'), 'utf8');

// --- self-check.md: substitution table section
const keys = Object.keys(mappings);
const rows = keys.map((k) => `| ${k} | ${mappings[k]} |`).join('\n');
const table = `## 置換表(表外字 → 常用漢字のみの代替)

出力に紛れやすい表外字と、常用漢字のみでの言い換え。生成後に1字ずつ照合する。

| 表外字 | 常用漢字のみの代替 |
|---|---|
${rows}
`;
const selfCheck = readFileSync(join(root, 'references', 'self-check.md'), 'utf8');
const updated = selfCheck.replace(/## 置換表[\s\S]*$/, table);
writeFileSync(join(root, 'references', 'self-check.md'), updated, 'utf8');
console.log(`joyo-2136.md: ${joyo.length} chars / self-check.md table: ${keys.length} rows`);