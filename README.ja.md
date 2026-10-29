# nise-chinese

[English](README.md) | 日本語 | [偽中国語](README.nise-chinese.md)

偽中国語エージェントはすべての返答を日本語の常用漢字(2136字)だけで生成する AI エージェント・スキル。ひらがな・カタカナ・英数字・表外漢字は禁止。記号(句読点など)と絵文字は使用可。

「私は学校に行きます」→「私学校行」(かな抜き基本形、漢語圧縮すると「我通学」)

視覚的には中国語の文章に見えるが、日本語話者は文脈で意味が取れる。漢字のみが並ぶことによる独特の滑稽さと力強さが武器。句読点や絵文字は自由に使えるので、文の区切りは読みやすく保てる。

## 何が入っている

| ファイル | 役割 |
|---|---|
| `SKILL.md` | スキル本体。LLMエージェントへの指示書 |
| `scripts/check.mjs` | 常用漢字検証CLI。リスト埋め込みの単一ファイル・ゼロ依存 |
| `references/self-check.md` | ツールなし環境向けの自己検閲手順+置換表 |
| `references/joyo-2136.md` | 常用漢字2136字の一覧(目視照合用) |
| `data/suggest.json` | 置換表の一次データ |
| `test/check.test.mjs` | チェッカーとドキュメント整合性のテスト |
| `README.md` / `README.ja.md` / `README.nise-chinese.md` | 説明書(英語既定/日本語/偽中国語) |

## 検証は3段構え

1. 機械検証(node がある環境): `node scripts/check.mjs "文章"`。常用漢字リストをスクリプト本体に埋め込んでいるので、この1ファイルだけをコピーすればどこでも動く(外部データ不要)
2. 半機械検証(node がない環境): `references/self-check.md` の手順で目視検査。かな・英数は視覚走査で一発判定(記号・絵文字は許可なので無視してよい)、漢字は86字の置換表+全2136字一覧と照合
3. 最終確認: 送信直前にかな・英数の混入を再確認

## 検証CLIの使い方

```console
# 文字列を検査
$ node scripts/check.mjs "我通学"
All characters are jōyō kanji or allowed symbols.

$ node scripts/check.mjs "此興味深"
Found 1 violation char(s):
  此 (U+6B64) at pos 0 [kanji] → suggest: "是"

# ファイルを検査
$ node scripts/check.mjs --file draft.txt

# 埋め込みデータの整合性確認
$ node scripts/check.mjs --stats
JOYO: 2136 chars / SUGGEST: 86 entries / bad suggest values: 0
```

違反があれば終了コード1、合格なら0。CIやエージェントの自己検閲ループにそのまま組める。モジュールとしても使える。

```js
import { checkString, JOYO, SUGGEST } from './check.mjs';
checkString('此興味深'); // [{ char: '此', pos: 0, cp: 'U+6B64', kind: 'kanji' }]
```

## インストール (DSH / DeepSeek Harness)

```console
git clone https://github.com/motchii709/nise-chinese
xcopy /E /I nise-chinese %USERPROFILE%\.dsh\skills\nise-chinese
```

skills/ はホットリロードされるので再起動不要。`/nise-chinese` または「偽中国語で返して」で発動。

## インストール (その他のエージェント)

`SKILL.md` は frontmatter つきの汎用 Agent Skills 形式。Claude Code 等のスキル機構に `nise-chinese/` ごと置けば動く。スキル機構がない環境でも `SKILL.md` をシステムプロンプトに貼り、応答前に `node scripts/check.mjs` を回せば同じ効果が得られる。node もない環境では `references/self-check.md` の手順で目視検査する。

## データの出所と検証

- `scripts/check.mjs` に埋め込んだ常用漢字リスト: kanjiapi.dev の `/v1/kanji/joyo`(2140件)から、2010年常用漢字表が括弧書きで添える康熙字典体の参照字体4字(𠮟・剝・塡・頰)を除外して2136字に整列。現代字体(剥・填・頬)を保持
- 一次ソースと交叉検証: [davidluzgouveia/kanji-data](https://github.com/davidluzgouveia/kanji-data) の grade 1-8 (2136字) と突き合わせ、差分は 填/頬(採用) vs 塡/頰(不採用) の字体選択2組のみであることを確認済み
- 再生成: `node tools/build-joyo.mjs && node tools/embed-joyo.mjs && node tools/gen-references.mjs`。生成物はテストで相互整合を担保(check.mjs の埋め込み = references/ の一覧 = suggest.json)

## 開発

```console
node --test test/check.test.mjs
```

16テスト: 埋め込みリストの字数・一意性・BMP範囲、純常用漢字文の合格、ひらがな/カタカナ/表外字/英数字の検出、記号・絵文字の合格、ゼロ幅文字の検出、suggest.jsonの全値が常用漢字のみであること、SKILL.md例文が全て常用漢字のみであること、references/ 2ファイルが埋め込みデータと完全一致することの検証。

## ライセンス

MIT
