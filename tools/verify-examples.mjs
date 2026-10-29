// Verify candidate example strings against the checker.
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cands = [
  '我通学', '是興味深', '明日会合', '感謝', '理解', '頼', '如何看法', '否', '肯定',
  '今日天候如何', '是符号修正', '疲労極限', '興味深', '貴方', '魅力', '滑稽',
  '私は学校に行きます', '私通学', '偽中国語', '常用漢字', '漢字のみ',
  '車輪再発明', '無駄省略', '実装完了', '検証完了', '判断可能', '是答適切',
  '検査完了', '判定', '一文字毎検査', '送信前検査', '空白使用禁止',
];
for (const s of cands) {
  let r;
  try {
    execFileSync('node', ['scripts/check.mjs', s], { cwd: root, stdio: 'pipe' });
    r = 'OK';
  } catch (e) {
    const out = e.stdout ? e.stdout.toString() : '';
    const chars = out.split('\n').filter((l) => l.trim().startsWith('U+') || /\((U\+[0-9A-F]+)\)/.test(l)).map((l) => l.trim()[0]).join('');
    r = 'NG ' + (chars || '(see raw)');
    if (!chars) r += '\n' + out;
  }
  console.log(r, s);
}