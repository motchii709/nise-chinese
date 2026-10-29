[English](README.md) / [日本語](README.ja.md) / 偽中国語

# 偽中国語

全応答、日本語常用漢字限。
平仮名・片仮名・英数字・表外字、使用禁止。記号・絵文字、使用可😄

基本変換例。
私学校行。

見掛、中国語文様。日本語話者、文脈判読可能。
漢字連続特有滑稽感、力強感、特徴。
本文自体、当規則適用実例。

## 内容物

`SKILL.md` 技術指示書本体
`scripts/check.mjs` 常用漢字検証器、単独動作、依存皆無
`references/self-check.md` 検証器使用不能環境向、自己検閲手順、置換表附属
`references/joyo-2136.md` 常用漢字全二千百三十六字一覧、目視照合用
`data/suggest.json` 置換表原本
`test/check.test.mjs` 検証試験群
`README.md`英語版、`README.ja.md`日本語版、本文、偽中国語版

## 検証三段階

一段、`node`在環境機械検証。
常用漢字一覧、検証器本体埋込。単独複写即動作、外部不要。

二段、検証器使用不能環境。
`references/self-check.md` 手順従、目視検査。
仮名・英数、視覚走査即判定。記号・絵文字、許可故、無視可。
漢字、置換表八十六字照合。疑義字、全一覧照合。

三段、送信直前、仮名・英数混入再確認。

## 検証器使用法

```
$ node scripts/check.mjs "我通学"
All characters are jōyō kanji or allowed symbols.

$ node scripts/check.mjs "此興味深"
Found 1 violation char(s):
  此 (U+6B64) at pos 0 [kanji] → suggest: "是"

$ node scripts/check.mjs --stats
JOYO: 2136 chars / SUGGEST: 86 entries / bad suggest values: 0
```

違反時、終了符号一。合格時、零。
反復検査、零違反到達後、応答出力可。

## 導入

```
git clone https://github.com/motchii709/nise-chinese
xcopy /E /I nise-chinese %USERPROFILE%\.dsh\skills\nise-chinese
```

導入後、即時有効化、再起動不要。
発動指示、`/nise-chinese`、又、偽中国語返答発話依頼。

## 原典

常用漢字一覧、`kanjiapi.dev` 由来。二千四十字内、旧字体参照字体四字除外、二千百三十六字整列。
現代字体、剥・填・頬保持。
[davidluzgouveia/kanji-data](https://github.com/davidluzgouveia/kanji-data) 交差検証済。差異、字体選択二組限。

## 試験

```
node --test test/check.test.mjs
```

十六試験。
埋込一覧、字数・一意性・`BMP` 範囲検証。
純常用漢字文、合格。
仮名・表外字・英数、検出。記号・絵文字、合格。
置換表全値、常用漢字限。
`SKILL.md` 例文全行検証。
文書間、完全一致担保。

## 許諾

許諾条項、`MIT`。
