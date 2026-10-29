// nise-chinese — 常用漢字(2136字)検証CLI。単一ファイル・ゼロ依存。
// 常用漢字リストと置換表をこのファイルに埋め込んでいるので、この1ファイルを
// どこに置いても `node check.mjs "文章"` で動く。モジュールとしても使える。
//
//   import { checkString, JOYO, SUGGEST } from './check.mjs';
//
// CLI:
//   node check.mjs "text"        文字列を検査
//   node check.mjs --file f.txt  ファイルを検査
//   node check.mjs --stats       埋め込みデータの統計を表示
//
// データの更新: tools/embed-joyo.mjs が JOYO/SUGGEST マーカー間を差し替える。

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// ===JOYO_BEGIN===
export const JOYO = new Set([
  '一丁七万丈三上下不与且世丘丙両並中串丸丹主丼久乏乗乙九乞乱乳乾亀了予争事二互五井亜亡交享京亭人仁今介仏仕他付仙代令以仮仰仲件任企',
  '伎伏伐休会伝伯伴伸伺似但位低住佐体何余作佳併使例侍供依価侮侯侵侶便係促俊俗保信修俳俵俸俺倉個倍倒候借倣値倫倹偉偏停健側偵偶偽傍傑',
  '傘備催傲債傷傾僅働像僕僚僧儀億儒償優元兄充兆先光克免児党入全八公六共兵具典兼内円冊再冒冗写冠冥冬冶冷凄准凍凝凡処凶凸凹出刀刃分切',
  '刈刊刑列初判別利到制刷券刹刺刻則削前剖剛剣剤剥副剰割創劇力功加劣助努励労効劾勃勅勇勉動勘務勝募勢勤勧勲勾匂包化北匠匹区医匿十千升',
  '午半卑卒卓協南単博占印危即却卵卸厄厘厚原厳去参又及友双反収叔取受叙口古句叫召可台叱史右号司各合吉同名后吏吐向君吟否含吸吹呂呈呉告',
  '周呪味呼命和咲咽哀品員哲哺唄唆唇唐唯唱唾商問啓善喉喚喜喝喩喪喫営嗅嗣嘆嘱嘲器噴嚇囚四回因団困囲図固国圏園土圧在地坂均坊坑坪垂型垣',
  '埋城域執培基埼堀堂堅堆堕堤堪報場塀塁塊塑塔塗塚塞塩填塾境墓増墜墨墳墾壁壇壊壌士壮声壱売変夏夕外多夜夢大天太夫央失奇奈奉奏契奔奥奨',
  '奪奮女奴好如妃妄妊妖妙妥妨妬妹妻姉始姓委姫姻姿威娘娠娯婆婚婦婿媒媛嫁嫉嫌嫡嬢子孔字存孝季孤学孫宅宇守安完宗官宙定宛宜宝実客宣室宮',
  '宰害宴宵家容宿寂寄密富寒寛寝察寡寧審寮寸寺対寿封専射将尉尊尋導小少尚就尺尻尼尽尾尿局居屈届屋展属層履屯山岐岡岩岬岳岸峠峡峰島崇崎',
  '崖崩嵐川州巡巣工左巧巨差己巻巾市布帆希帝帥師席帯帰帳常帽幅幕幣干平年幸幹幻幼幽幾庁広床序底店府度座庫庭庶康庸廃廉廊延廷建弁弄弊式',
  '弐弓弔引弟弥弦弧弱張強弾当彙形彩彫彰影役彼往征径待律後徐徒従得御復循微徳徴徹心必忌忍志忘忙応忠快念怒怖思怠急性怨怪恋恐恒恣恥恨恩',
  '恭息恵悔悟悠患悦悩悪悲悼情惑惜惧惨惰想愁愉意愚愛感慄慈態慌慎慕慢慣慨慮慰慶憂憎憤憧憩憬憲憶憾懇懐懲懸成我戒戚戦戯戴戸戻房所扇扉手',
  '才打払扱扶批承技抄把抑投抗折抜択披抱抵抹押抽担拉拍拐拒拓拘拙招拝拠拡括拭拳拶拷拾持指挑挙挟挨挫振挿捉捕捗捜捨据捻掃授掌排掘掛採探',
  '接控推措掲描提揚換握揮援揺損搬搭携搾摂摘摩摯撃撤撮撲擁操擦擬支改攻放政故敏救敗教敢散敬数整敵敷文斉斎斑斗料斜斤斥斬断新方施旅旋族',
  '旗既日旦旧旨早旬旺昆昇明易昔星映春昧昨昭是昼時晩普景晴晶暁暇暑暖暗暦暫暮暴曇曖曜曲更書曹曽替最月有服朕朗望朝期木未末本札朱朴机朽',
  '杉材村束条来杯東松板析枕林枚果枝枠枢枯架柄某染柔柱柳柵査柿栃栄栓校株核根格栽桁桃案桑桜桟梅梗梨械棄棋棒棚棟森棺椅植椎検業極楷楼楽',
  '概構様槽標模権横樹橋機欄欠次欧欲欺款歌歓止正武歩歯歳歴死殉殊残殖殴段殺殻殿毀母毎毒比毛氏民気水氷永氾汁求汎汗汚江池汰決汽沃沈沖沙',
  '没沢河沸油治沼沿況泉泊泌法泡波泣泥注泰泳洋洗洞津洪活派流浄浅浜浦浪浮浴海浸消涙涯液涼淑淡淫深混添清渇済渉渋渓減渡渦温測港湖湧湯湾',
  '湿満源準溝溶溺滅滋滑滝滞滴漁漂漆漏演漠漢漫漬漸潔潜潟潤潮潰澄激濁濃濫濯瀬火灯灰災炉炊炎炭点為烈無焦然焼煎煙照煩煮熊熟熱燃燥爆爪爵',
  '父爽片版牙牛牧物牲特犠犬犯状狂狙狩独狭猛猟猫献猶猿獄獣獲玄率玉王玩珍珠班現球理琴瑠璃璧環璽瓦瓶甘甚生産用田由甲申男町画界畏畑畔留',
  '畜畝略番異畳畿疎疑疫疲疾病症痕痘痛痢痩痴瘍療癒癖発登白百的皆皇皮皿盆益盗盛盟監盤目盲直相盾省眉看県真眠眺眼着睡督睦瞬瞭瞳矛矢知短',
  '矯石砂研砕砲破硝硫硬碁碑確磁磨礁礎示礼社祈祉祖祝神祥票祭禁禅禍福秀私秋科秒秘租秩称移程税稚種稲稼稽稿穀穂積穏穫穴究空突窃窒窓窟窮',
  '窯立竜章童端競竹笑笛符第筆等筋筒答策箇箋算管箱箸節範築篤簡簿籍籠米粉粋粒粗粘粛粧精糖糧糸系糾紀約紅紋納純紙級紛素紡索紫累細紳紹紺',
  '終組経結絞絡給統絵絶絹継続維綱網綻綿緊総緑緒線締編緩緯練緻縁縄縛縦縫縮績繁繊織繕繭繰缶罪置罰署罵罷羅羊美羞群羨義羽翁翌習翻翼老考',
  '者耐耕耗耳聖聞聴職肉肌肖肘肝股肢肥肩肪肯育肺胃胆背胎胞胴胸能脂脅脇脈脊脚脱脳腎腐腕腫腰腸腹腺膚膜膝膨膳臆臓臣臨自臭至致臼興舌舎舗',
  '舞舟航般舶舷船艇艦良色艶芋芝芯花芳芸芽苗苛若苦英茂茎茨茶草荒荘荷菊菌菓菜華萎落葉著葛葬蒸蓄蓋蔑蔵蔽薄薦薪薫薬藍藤藩藻虎虐虚虜虞虫',
  '虹蚊蚕蛇蛍蛮蜂蜜融血衆行術街衛衝衡衣表衰衷袋袖被裁裂装裏裕補裸製裾複褐褒襟襲西要覆覇見規視覚覧親観角解触言訂訃計討訓託記訟訪設許',
  '訳訴診証詐詔評詞詠詣試詩詮詰話該詳誇誉誌認誓誕誘語誠誤説読誰課調談請論諦諧諭諮諸諾謀謁謄謎謙講謝謡謹識譜警議譲護谷豆豊豚象豪貌貝',
  '貞負財貢貧貨販貪貫責貯貴買貸費貼貿賀賂賃賄資賊賓賛賜賞賠賢賦質賭購贈赤赦走赴起超越趣足距跡路跳践踊踏踪蹴躍身車軌軍軒軟転軸軽較載',
  '輝輩輪輸轄辛辞辣辱農辺込迅迎近返迫迭述迷追退送逃逆透逐逓途通逝速造連逮週進逸遂遅遇遊運遍過道達違遜遠遡遣適遭遮遵遷選遺避還那邦邪',
  '邸郊郎郡部郭郵郷都酌配酎酒酔酢酪酬酵酷酸醒醜醸采釈里重野量金釜針釣鈍鈴鉄鉛鉢鉱銀銃銅銘銭鋭鋳鋼錠錦錬錮錯録鍋鍛鍵鎌鎖鎮鏡鐘鑑長門',
  '閉開閑間関閣閥閲闇闘阜阪防阻附降限陛院陣除陥陪陰陳陵陶陸険陽隅隆隊階随隔隙際障隠隣隷隻雄雅集雇雌雑離難雨雪雰雲零雷電需震霊霜霧露',
  '青静非面革靴韓音韻響頂頃項順須預頑頒頓領頬頭頻頼題額顎顔顕願類顧風飛食飢飯飲飼飽飾餅養餌餓館首香馬駄駅駆駐駒騎騒験騰驚骨骸髄高髪',
  '鬱鬼魂魅魔魚鮮鯨鳥鳴鶏鶴鹿麓麗麦麺麻黄黒黙鼓鼻齢',
].join(''));
// ===JOYO_END===

// ===SUGGEST_BEGIN===
export const SUGGEST = {
  '之': '是',
  '也': '又',
  '乃': '則',
  '亦': '又',
  '而': '且',
  '曾': '前',
  '只': '唯',
  '仍': '尚',
  '忽': '急',
  '倘': '若',
  '裡': '内',
  '舊': '古',
  '淺': '浅',
  '廣': '広',
  '狹': '狭',
  '輕': '軽',
  '萬': '万',
  '圓': '円',
  '與': '与',
  '從': '従',
  '來': '来',
  '對': '対',
  '處': '処',
  '學': '学',
  '國': '国',
  '會': '会',
  '體': '体',
  '氣': '気',
  '圖': '図',
  '畫': '画',
  '聽': '聴',
  '說': '説',
  '讀': '読',
  '寫': '写',
  '關': '関',
  '鬧': '騒',
  '絲': '糸',
  '經': '経',
  '續': '続',
  '總': '総',
  '繼': '継',
  '賣': '売',
  '遲': '遅',
  '邊': '辺',
  '鄉': '郷',
  '靈': '霊',
  '靜': '静',
  '顏': '顔',
  '顯': '顕',
  '餘': '余',
  '髮': '髪',
  '點': '点',
  '黨': '党',
  '齊': '斉',
  '齒': '歯',
  '龍': '竜',
  '壽': '寿',
  '溫': '温',
  '寬': '寛',
  '獨': '独',
  '獸': '獣',
  '盡': '尽',
  '歸': '帰',
  '龜': '亀',
  '澤': '沢',
  '濟': '済',
  '廢': '廃',
  '發': '発',
  '觀': '観',
  '樂': '楽',
  '藥': '薬',
  '藝': '芸',
  '藏': '蔵',
  '號': '号',
  '蟲': '虫',
  '證': '証',
  '譯': '訳',
  '豐': '豊',
  '變': '変',
  '讓': '譲',
  '豔': '艶',
  '豬': '豚',
  '貓': '猫',
  '贊': '賛',
  '麵': '麺',
  '亂': '乱',
};
// ===SUGGEST_END===

// Policy: only kana, ASCII/fullwidth alnum, and non-jōyō han characters are
// violations. Everything else — punctuation, arrows, emoji, whitespace — is
// allowed. Zero-width junk (ZWSP etc.) is flagged for safety.
function isAlnumCp(cp) {
  return (cp >= 0x30 && cp <= 0x39) || (cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a)
    || (cp >= 0xff10 && cp <= 0xff19) || (cp >= 0xff21 && cp <= 0xff3a) || (cp >= 0xff41 && cp <= 0xff5a);
}

function violationKind(cp) {
  if (cp === 0x30fb) return null; // ・ middle dot (lives in Katakana block) is a symbol
  if ((cp >= 0x3040 && cp <= 0x309f) || (cp >= 0x30a0 && cp <= 0x30ff) || (cp >= 0x31f0 && cp <= 0x31ff) || (cp >= 0xff66 && cp <= 0xff9f)) return 'kana';
  if (isAlnumCp(cp)) return 'alnum';
  if (cp === 0x200b || cp === 0x2060 || cp === 0xfeff) return 'invisible';
  if ((cp >= 0x2e80 && cp <= 0x2eff) || (cp >= 0x3400 && cp <= 0x4dbf) || (cp >= 0x4e00 && cp <= 0x9fff)
    || (cp >= 0xf900 && cp <= 0xfaff) || cp >= 0x20000) return 'kanji';
  return null; // symbols, emoji, whitespace → allowed
}

export function checkString(str) {
  const issues = [];
  for (let i = 0; i < str.length;) {
    const cp = str.codePointAt(i);
    const ch = str.slice(i, i + (cp > 0xffff ? 2 : 1));
    if (!JOYO.has(ch)) {
      const kind = violationKind(cp);
      if (kind) issues.push({ char: ch, pos: i, cp: `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`, kind });
    }
    i += ch.length;
  }
  return issues;
}

function printIssues(issues) {
  console.log(`Found ${issues.length} violation char(s):`);
  for (const i of issues) {
    const repl = SUGGEST[i.char];
    console.log(`  ${i.char} (${i.cp}) at pos ${i.pos} [${i.kind}]${repl ? ` → suggest: "${repl}"` : ''}`);
  }
}

function main(argv) {
  const fileIdx = argv.indexOf('--file');

  if (argv.includes('--stats')) {
    const bad = Object.entries(SUGGEST).filter(([, v]) => checkString(v).length > 0);
    console.log(`JOYO: ${JOYO.size} chars / SUGGEST: ${Object.keys(SUGGEST).length} entries / bad suggest values: ${bad.length}`);
    process.exit(bad.length ? 1 : 0);
  }

  const input = fileIdx >= 0 && argv[fileIdx + 1]
    ? readFileSync(argv[fileIdx + 1], 'utf8')
    : (fileIdx < 0 ? argv : argv.filter((a, i) => i !== fileIdx && i !== fileIdx + 1)).join(' ');

  if (!input) {
    console.log('Usage: node check.mjs "text" | --file f.txt | --stats');
    process.exit(1);
  }

  const issues = checkString(input);
  if (issues.length) {
    printIssues(issues);
    process.exit(1);
  } else {
    console.log('All characters are jōyō kanji or allowed symbols.');
    process.exit(0);
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main(process.argv.slice(2));
}