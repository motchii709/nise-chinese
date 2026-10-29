[English](README.md) / [日本語](README.ja.md) / 偽中国語

# 偽中国語

全応答日本語常用漢字限
平仮名片仮名英数字記号一切使用禁止

基本変換例
私学校行

見掛中国語文様日本語話者文脈判読可能
漢字連続特有滑稽感力強感特徴
本文自体当規則適用実例

## 内容物

`SKILL.md` 技術指示書本体
`scripts/check.mjs` 常用漢字検証器単独動作依存皆無
`references/self-check.md` 検証器使用不能環境向自己検閲手順置換表附属
`references/joyo-2136.md` 常用漢字全二千百三十六字一覧目視照合用
`data/suggest.json` 置換表原本
`test/check.test.mjs` 検証試験群
`README.md`英語版`README.ja.md`日本語版本文偽中国語版

## 検証三段階

一段`node`在環境機械検証
常用漢字一覧検証器本体埋込単独複写即動作外部不要

二段検証器使用不能環境
`references/self-check.md`手順従目視検査
平仮名片仮名英数記号視覚走査即判定
漢字置換表八十六字照合疑義字全一覧照合

三段送信直前平仮名記号混入再確認

## 検証器使用法

```
$ node scripts/check.mjs "我通学"
All characters are jōyō kanji.

$ node scripts/check.mjs "此興味深"
Found 1 non-jōyō char(s):
  此 (U+6B64) at pos 0 → suggest: "是"

$ node scripts/check.mjs --stats
JOYO: 2136 chars / SUGGEST: 86 entries / bad suggest values: 0
```

違反時終了符号一合格時零
反復検査零違反到達後応答出力可

## 導入

```
git clone https://github.com/motchii709/nise-chinese
xcopy /E /I nise-chinese %USERPROFILE%\.dsh\skills\nise-chinese
```

導入後即時有効化再起動不要
発動指示`/nise-chinese`又偽中国語返答発話依頼

## 原典

常用漢字一覧`kanjiapi.dev`由来二千四十字内
旧字体参照字体四字除外二千百三十六字整列
現代字体剥填頬保持
[davidluzgouveia/kanji-data](https://github.com/davidluzgouveia/kanji-data) 交差検証済差異字体選択二組限

## 試験

```
node --test test/check.test.mjs
```

十一試験
埋込一覧字数一意性`BMP`範囲検証
純常用漢字文合格
平仮名片仮名表外字記号検出
置換表全値常用漢字限
`SKILL.md`例文全行検証
文書間完全一致担保

## 許諾

許諾条項`MIT`
