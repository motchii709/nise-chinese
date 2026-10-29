# pseudo-chinese

**偽中国語エージェント** — すべての返答を日本語の常用漢字(2136字)だけで生成する AI エージェント・スキル。ひらがな・カタカナ・英数字・記号・表外漢字は一切使用禁止。

「私は学校に行きます」→「我通学」

視覚的には中国語の文章に見えるが、日本語話者は文脈で意味が取れる。漢字のみが並ぶことによる独特の滑稽さと力強さが武器。

## 何が入っている

| ファイル | 役割 |
|---|---|
| `SKILL.md` | スキル本体。LLMエージェントへの指示書 |
| `scripts/check.mjs` | 常用漢字検証CLI。ゼロ依存、Node.js本体のみ |
| `data/joyo-2136.txt` | 常用漢字2136字リスト(1行1字) |
| `data/suggest.json` | 表外字 → 常用漢字の置換ヒント |
| `test/check.test.mjs` | チェッカーとデータのテスト |

## 検証CLIの使い方

```console
# 文字列を検査
$ node scripts/check.mjs "我通学"
All characters are jōyō kanji.

$ node scripts/check.mjs "此興味深"
Found 1 non-jōyō char(s):
  此 (U+6B64) at pos 0 → suggest: "是"

# ファイルを検査
$ node scripts/check.mjs --file draft.txt

# データファイルの整合性検証
$ node scripts/check.mjs --validate-data
joyo-2136: OK (2136 unique BMP chars)
suggest.json: OK (all values jōyō-only)
```

違反があれば終了コード1、合格なら0。CIやエージェントの自己検閲ループにそのまま組める。

## インストール (DSH / DeepSeek Harness)

```console
git clone https://github.com/motchii709/pseudo-chinese
copy pseudo-chinese\SKILL.md %USERPROFILE%\.dsh\skills\pseudo-chinese\SKILL.md
xcopy /E /I pseudo-chinese\scripts %USERPROFILE%\.dsh\skills\pseudo-chinese\scripts
xcopy /E /I pseudo-chinese\data %USERPROFILE%\.dsh\skills\pseudo-chinese\data
```

skills/ はホットリロードされるので再起動不要。`/pseudo-chinese` または「偽中国語で返して」で発動。

## インストール (その他のエージェント)

`SKILL.md` は frontmatter つきの汎用 Agent Skills 形式。Claude Code 等のスキル機構に `pseudo-chinese/` ごと置けば動く。スキル機構がない環境でも `SKILL.md` をシステムプロンプトに貼り、応答前に `node scripts/check.mjs` を回せば同じ効果が得られる。

## データの出所と検証

- `data/joyo-2136.txt`: kanjiapi.dev の `/v1/kanji/joyo`(2140件)から、2010年常用漢字表が括弧書きで添える康熙字典体の参照字体4字(𠮟・剝・塡・頰)を除外して2136字に整列。現代字体(剥・填・頬)を保持
- 一次ソースと交叉検証: [davidluzgouveia/kanji-data](https://github.com/davidluzgouveia/kanji-data) の grade 1-8 (2136字) と突き合わせ、差分は 填/頬(採用) vs 塡/頰(不採用) の字体選択2組のみであることを確認済み
- 再生成: `node tools/fetch-joyo.mjs && node tools/crosscheck-joyo.mjs && node tools/make-2136.mjs`

## 開発

```console
node --test test/check.test.mjs
```

7テスト: リストの字数・一意性・BMP範囲、純常用漢字文の合格、ひらがな/カタカナ/記号の検出、suggest.jsonの全値が常用漢字のみであることの検証。

## ライセンス

MIT
