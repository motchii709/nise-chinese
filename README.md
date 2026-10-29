# nise-chinese

English | [日本語](README.ja.md) | [偽中国語](README.nise-chinese.md)

**Pseudo-Chinese agent skill** — an AI agent skill that answers *only* in Japanese jōyō kanji (the official 2,136-character list). Hiragana, katakana, Latin letters, digits, punctuation, and non-jōyō kanji are all banned.

「私は学校に行きます」→「私学校行」(kana-stripped base form; compressed variant: 我通学)

It *looks* like Chinese, but Japanese speakers can parse it from context. The wall of kanji is the joke — and the point.

## What's inside

| File | Role |
|---|---|
| `SKILL.md` | The skill itself. Instructions for the LLM agent |
| `scripts/check.mjs` | Jōyō kanji validator CLI. Single self-contained file, zero dependencies |
| `references/self-check.md` | Manual self-check procedure + substitution table for environments without tooling |
| `references/joyo-2136.md` | The full 2,136-kanji list for manual lookup |
| `data/suggest.json` | Source of truth for the substitution table |
| `test/check.test.mjs` | Tests for the checker and doc/data consistency |
| `README.md` / `README.ja.md` / `README.nise-chinese.md` | Docs (English default / Japanese / pseudo-Chinese) |

## Verification in three tiers

1. **Machine check** (where node exists): `node scripts/check.mjs "text"`. The kanji list is embedded *in the script itself*, so copying this single file is enough — no external data.
2. **Semi-manual check** (no node): follow `references/self-check.md`. Kana/ASCII/symbols are caught by visual scanning; kanji are checked against the 86-entry substitution table and the full 2,136-kanji list.
3. **Final pass**: re-scan for stray kana/symbols right before sending.

## CLI usage

```console
# check a string
$ node scripts/check.mjs "我通学"
All characters are jōyō kanji.

$ node scripts/check.mjs "此興味深"
Found 1 non-jōyō char(s):
  此 (U+6B64) at pos 0 → suggest: "是"

# check a file
$ node scripts/check.mjs --file draft.txt

# verify embedded data integrity
$ node scripts/check.mjs --stats
JOYO: 2136 chars / SUGGEST: 86 entries / bad suggest values: 0
```

Exit code 1 on violation, 0 on pass — drop it straight into CI or an agent's self-critique loop. It also works as a module:

```js
import { checkString, JOYO, SUGGEST } from './check.mjs';
checkString('此興味深'); // [{ char: '此', pos: 0, cp: 'U+6B64' }]
```

## Install (DSH / DeepSeek Harness)

```console
git clone https://github.com/motchii709/nise-chinese
xcopy /E /I nise-chinese %USERPROFILE%\.dsh\skills\nise-chinese
```

The `skills/` directory hot-reloads; no restart needed. Invoke with `/nise-chinese` or just ask 「偽中国語で返して」.

## Install (other agents)

`SKILL.md` is a standard Agent Skills file (frontmatter + markdown). Drop the `nise-chinese/` folder into any skills directory (Claude Code etc.). Without a skill mechanism, paste `SKILL.md` into the system prompt and run `node scripts/check.mjs` on drafts before sending. Without node at all, use the manual procedure in `references/self-check.md`.

## Data provenance

- The kanji list embedded in `scripts/check.mjs` comes from kanjiapi.dev `/v1/kanji/joyo` (2,140 entries), minus the 4 Kangxi-dictionary reference forms that the 2010 jōyō table lists in parentheses (𠮟・剝・塡・頰), yielding 2,136 characters. Modern print forms (剥・填・頬) are kept.
- Cross-checked against [davidluzgouveia/kanji-data](https://github.com/davidluzgouveia/kanji-data) grade 1–8 (2,136 chars). The only differences are the font-variant choices for two pairs: 填/頬 (ours) vs 塡/頰 (kanji-data).
- Regenerate: `node tools/build-joyo.mjs && node tools/embed-joyo.mjs && node tools/gen-references.mjs`. Consistency between the embedded list, `references/`, and `data/suggest.json` is enforced by tests.

## Development

```console
node --test test/check.test.mjs
```

11 tests: embedded list count/uniqueness/BMP range, pass on pure-jōyō text, detection of hiragana/katakana/non-jōyō kanji/symbols, all substitution values being jōyō-only, SKILL.md examples being valid, and both `references/` files matching the embedded data exactly.

## License

MIT
