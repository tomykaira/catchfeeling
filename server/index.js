/* jshint esversion: 6 */

const express = require('express');
const app = express();
const WebSocket = require('ws');
const expressWs = require('express-ws')(app);

const kMinPlayerCount = 2;
const gameTimeout = 120 * 1000;
const revealLengthTime = 30 * 1000;
const revealPrefixTime = 60 * 1000;
const revealSuffixTime = 90 * 1000;
const players = [];
// Use only ひらがな
const dictionary = [

'じょうはんしん',
'かはんしん',
'あたま',
'かみのけ',
'ひたい',
'こめかみ',
'まゆげ',
'まつげ',
'まぶた',
'めだま',
'はな',
'ほほ',
'くち',
'くちびる',
'した',
'みみ',
'みみたぶ',
'あご',
'のど',
'あごひげ',
'くちひげ',
'ほおひげ',
'もみあげ',
'しわ',
'えくぼ',
'ほくろ',
'けあな',
'くび',
'てのひら',
'ゆび',
'おやゆび',
'ひとさしゆび',
'なかゆび',
'くすりゆび',
'こゆび',
'つめ',
'うで',
'ひじ',
'てくび',
'こぶし',
'かた',
'むね',
'おっぱい',
'わき',
'おなか',
'こし',
'へそ',
'せなか',
'しり',
'あし',
'ふともも',
'ふくらはぎ',
'ひざ',
'すね',
'あしくび',
'つまさき',
'かかと',
'あしのうら',
'つちふまず',
'ほね',
'がいこつ',
'ずがいこつ',
'せぼね',
'ろっこつ',
'かんせつ',
'ゆびかんせつ',
'こつずい',
'けつえき',
'けっかん',
'どうみゃく',
'じょうみゃく',
'のう',
'ないぞう',
'しんぞう',
'はい',
'い',
'ちょう',
'だいちょう',
'しょうちょう',
'じゅうにしちょう',
'かんぞう',
'じんぞう',
'ひぞう',
'しきゅう',
'へそのお',
'こうもん',
'きんにく',
'ごかん',
'しんけい',
'たいりょく',
'こっせつ',
'やけど',
'みずぶくれ',
'しゅっけつ',
'ないしゅっけつ',
'あざ',
'だぼく',
'ねんざ',
'きず',
'かすりきず',
'かみきず',
'きりきず',
'さしきず',
'むしさされ',
'かのう',
'うみ',
'かさぶた',
'たんこぶ',
'はなぢ',
'むちうち',
'しんさつ',
'しんだん',
'しゅじゅつ',
'ぞうきいしょく',
'ゆけつ',
'けつえきけんさ',
'れんとげん',
'いかめら',
'しんでんず',
'くすり',
'しょほうせん',
'ちゅうしゃ',
'よぼうせっしゅ',
'わくちん',
'めんえき',
'りはびり',
'じょうざい',
'かんぼうやく',
'こうせいぶっしつ',
'あすぴりん',
'ちんつうざい',
'すいみんやく',
'げどくざい',
'しょうかやく',
'げざい',
'ざやく',
'せきどめ',
'ふくさよう',
'たんか',
'ぎぷす',
'まつばづえ',
'ほうたい',
'ばんそうこう',
'がーぜ',
'きゅうきゅうばこ',
'いぬ',
'おおかみ',
'ねこ',
'うま',
'うし',
'しか',
'ひつじ',
'やぎ',
'ぶた',
'うさぎ',
'りす',
'ねずみ',
'はむすたー',
'もぐら',
'やまあらし',
'たぬき',
'きつね',
'いたち',
'いのしし',
'くま',
'さる',
'ちんぱんじー',
'おらんうーたん',
'なまけもの',
'ごりら',
'とら',
'らいおん',
'ひょう',
'くろひょう',
'じゃがー',
'ばっふぁろー',
'ばいそん',
'ぞう',
'ぱんだ',
'さい',
'かば',
'きりん',
'しまうま',
'らくだ',
'ろば',
'となかい',
'らっこ',
'すかんく',
'あらいぐま',
'ありくい',
'ばく',
'こあら',
'かんがるー',
'あしか',
'せいうち',
'あざらし',
'おっとせい',
'かめ',
'わに',
'へび',
'がらがらへび',
'とかげ',
'かえる',
'ひきがえる',
'おたまじゃくし',
'すずめ',
'つばめ',
'にわとり',
'ひよこ',
'からす',
'わたりがらす',
'はと',
'きじ',
'つる',
'わし',
'たか',
'はやぶさ',
'ひばり',
'ふくろう',
'みみずく',
'かも',
'あひる',
'がちょう',
'らいちょう',
'だちょう',
'あほうどり',
'しちめんちょう',
'さぎ',
'とき',
'こうのとり',
'はくちょう',
'かもめ',
'うみねこ',
'おうむ',
'いんこ',
'かなりあ',
'かわせみ',
'きつつき',
'くじゃく',
'ぺんぎん',
'ぺりかん',
'ふらみんご',
'こうもり',
'かぶとむし',
'くわがたむし',
'かなぶん',
'とんぼ',
'ばった',
'いなご',
'かまきり',
'かみきりむし',
'はさみむし',
'あり',
'しろあり',
'はち',
'みつばち',
'すずめばち',
'はえ',
'こおろぎ',
'てんとうむし',
'さなぎ',
'あげはちょう',
'もんしろちょう',
'せみ',
'ほたる',
'くも',
'いもむし',
'けむし',
'かいこ',
'むかで',
'みのむし',
'ありじごく',
'うすばかげろう',
'まつむし',
'あめんぼ',
'かたつむり',
'なめくじ',
'みみず',
'さそり',
'ごきぶり',
'ぷらなりあ',
'いわし',
'さば',
'あじ',
'かつお',
'まぐろ',
'かれい',
'ひらめ',
'あゆ',
'なまず',
'さけ',
'たら',
'あんこう',
'ちょうちんあんこう',
'さんま',
'かじき',
'ふぐ',
'はりせんぼん',
'ししゃも',
'たちうお',
'とびうお',
'こばんざめ',
'しーらかんす',
'めだか',
'きんぎょ',
'でめきん',
'ぶらっくばす',
'ぴらにあ',
'どじょう',
'えい',
'しゃち',
'さめ',
'いるか',
'くじら',
'うなぎ',
'でんきうなぎ',
'いか',
'ほたるいか',
'だいおういか',
'くらげ',
'ひとで',
'なまこ',
'うみうし',
'えび',
'いせえび',
'くるまえび',
'かに',
'たらばがに',
'ずわいがに',
'けがに',
'ざりがに',
'やどかり',
'あさり',
'しじみ',
'ほたて',
'はまぐり',
'あわび',
'さざえ',
'むーるがい',
'うに',
'わかめ',
'こんぶ',
'さんご',
'いくら',
'かずのこ',
'たらこ',
'ねぎ',
'にんじん',
'ぴーまん',
'ぱぷりか',
'なす',
'じゃがいも',
'さつまいも',
'さといも',
'ごぼう',
'きゃべつ',
'れたす',
'さにーれたす',
'さらだな',
'とまと',
'ぷちとまと',
'きゅうり',
'へちま',
'とうがん',
'ごーや',
'ずっきーに',
'だいこん',
'かいわれだいこん',
'れんこん',
'かぶ',
'びーつ',
'もやし',
'かぼちゃ',
'たけのこ',
'はくさい',
'とうもろこし',
'せろり',
'にんにく',
'らっきょう',
'ちこりー',
'ぶろっこりー',
'かりふらわー',
'あすぱらがす',
'ぱせり',
'にら',
'おくら',
'しそ',
'みつば',
'ほうれんそう',
'ちんげんさい',
'のざわな',
'こまつな',
'くれそん',
'けーる',
'もろへいや',
'ばじる',
'ぜんまい',
'みょうが',
'みずな',
'とうがらし',
'ししとう',
'しょうが',
'わさび',
'さんしょう',
'ごま',
'だいず',
'えだまめ',
'くろまめ',
'あずき',
'えんどう',
'さやえんどう',
'いんげんまめ',
'さやいんげん',
'そらまめ',
'りょくとう',
'ささげ',
'ひよこまめ',
'ぐりーんぴーす',
'げんまい',
'しいたけ',
'えのきだけ',
'なめこ',
'きくらげ',
'まっしゅるーむ',
'とりゅふ',
'あがりくす',
'すいか',
'めろん',
'さくらんぼ',
'ばなな',
'りんご',
'なし',
'ようなし',
'かりん',
'かんきつるい',
'みかん',
'きんかん',
'あまなつ',
'ぐれーぷふるーつ',
'れもん',
'らいむ',
'かき',
'ぶどう',
'いちご',
'ぶるーべりー',
'いちじく',
'ざくろ',
'びわ',
'あけび',
'なつめ',
'きぅい',
'らいち',
'あせろら',
'まんごー',
'ぱいなっぷる',
'ぱぱいや',
'すたーふるーつ',
'あぼかど',
'ぱっしょんふるーつ',
'どりあん',
'ここなっつ',
'かかお',
'こーひーまめ',
'おりーぶ',
'くり',
'らっかせい',
'あーもんど',
'かしゅーなっつ',
'ぴすたちお',
'くるみ',
'ぎんなん',
'どんぐり',
'ざっそう',
'きのみ',
'かじつ',
'このは',
'くき',
'えだ',
'こえだ',
'しんめ',
'つぼみ',
'たね',
'きゅうこん',
'とげ',
'すみれ',
'きく',
'らん',
'はす',
'あさがお',
'ひるがお',
'ゆうがお',
'すずらん',
'すいせん',
'すいれん',
'ばしょう',
'ゆり',
'もくれん',
'つつじ',
'しゃくやく',
'しょうぶ',
'ばら',
'たんぽぽ',
'ひまわり',
'あじさい',
'さざんか',
'なのはな',
'さくら',
'うめ',
'もも',
'つくし',
'さとうきび',
'やしのき',
'じてんしゃ',
'さんりんしゃ',
'いちりんしゃ',
'うばぐるま',
'くるまいす',
'すけぼー',
'じんりきしゃ',
'ばしゃ',
'ぎっしゃ',
'いぬぞり',
'おーとばい',
'すのーもーびる',
'せぐうぇい',
'かーと',
'じどうしゃ',
'きゃんぴんぐかー',
'たくしー',
'ばす',
'ぱとかー',
'きゅうきゅうしゃ',
'しょうぼうしゃ',
'はしごしゃ',
'じょせつしゃ',
'れっかーしゃ',
'とらっく',
'でことら',
'とれーらー',
'とらくたー',
'ふぉーくりふと',
'しょべるかー',
'ぶるどーざー',
'くれーんしゃ',
'ごみしゅうしゅうしゃ',
'そうこうしゃ',
'せんしゃ',
'じそうほう',
'きしゃ',
'でんしゃ',
'でぃーぜるしゃ',
'ちかてつ',
'ものれーる',
'とろりーばす',
'けーぶるかー',
'ろーぷうぇい',
'いかだ',
'ぼーと',
'かぬー',
'わたしぶね',
'やかたぶね',
'よっと',
'じぇっとすきー',
'ふね',
'ぎょせん',
'がれおんせん',
'もーたーぼーと',
'ほばーくらふと',
'ふぇりー',
'たんかー',
'せんかん',
'くちくかん',
'じゅんようかん',
'せんすいかん',
'すいらいてい',
'ようりくかん',
'ゆそうかん',
'いーじすかん',
'こうくうぼかん',
'ぱらしゅーと',
'はんぐぐらいだー',
'ぱらぐらいだー',
'ききゅう',
'ひこうせん',
'へりこぷたー',
'ひこうき',
'ぷろぺらき',
'じぇっとき',
'せんとうき',
'こうげきき',
'ばくげきき',
'うちゅうろけっと',
'すぺーすしゃとる',
'うでどけい',
'とけい',
'かばん',
'はんどばっぐ',
'りゅっくさっく',
'さいふ',
'ていきいれ',
'はんかち',
'ちりがみ',
'かさ',
'めがね',
'こんたくとれんず',
'えんぴつ',
'いろえんぴつ',
'えんぴつけずり',
'けしごむ',
'しゅうせいえき',
'しゃーぺん',
'ぼーるぺん',
'けいこうぺん',
'ぺん',
'ふで',
'すみ',
'すずり',
'ぶんちん',
'したじき',
'えふで',
'えのぐ',
'のーと',
'めもちょう',
'でんぴょう',
'ほうがんし',
'とれーしんぐぺーぱー',
'ばいんだー',
'はさみ',
'かったー',
'ほっちきす',
'くりっぷ',
'わごむ',
'がびょう',
'のり',
'せろはんてーぷ',
'りょうめんてーぷ',
'がむてーぷ',
'じょうぎ',
'さんかくじょうぎ',
'ぶんどき',
'こんぱす',
'ふうとう',
'びんせん',
'はがき',
'きって',
'でんたく',
'ぼーる',
'むしき',
'みずきり',
'ざる',
'ちゃこし',
'ふるい',
'おろしがね',
'あわたてき',
'かわむきき',
'おたま',
'へら',
'ふらいがえし',
'めんぼう',
'けいりょうかっぷ',
'けいりょうすぷーん',
'はかり',
'たいまー',
'ほうちょう',
'まないた',
'やかん',
'ふらいぱん',
'ふかなべ',
'ひらなべ',
'しちゅーなべ',
'あつりょくなべ',
'なべぶた',
'なべつかみ',
'なべしき',
'やきあみ',
'かんきり',
'せんぬき',
'こなびきき',
'にくひきき',
'ろうと',
'えぷろん',
'まほうびん',
'すいはんき',
'しゃもじ',
'しょっき',
'はし',
'ないふ',
'ふぉーく',
'すぷーん',
'ちゃさじ',
'さら',
'うけざら',
'さらだぼーる',
'ちゃわん',
'ようき',
'とうじき',
'しっき',
'ぎんしょっき',
'ぼん',
'かいてんとれー',
'たっぱー',
'こっぷ',
'わいんぐらす',
'びーるじょっき',
'かっぷ',
'まぐかっぷ',
'てぃーかっぷ',
'こーひーかっぷ',
'なぷきん',
'だいふきん',
'てーぶるくろす',
'らっぷ',
'あるみほいる',
'せんざい',
'くれんざー',
'しょっきふき',
'さいほうばこ',
'はり',
'まちばり',
'はりさし',
'いと',
'ゆびぬき',
'たちばさみ',
'あみぼう',
'まきじゃく',
'みしん',
'あいろん',
'あいろんだい',
'のこぎり',
'くぎ',
'かなづち',
'しゃべる',
'やすり',
'かんな',
'のみ',
'きり',
'はしご',
'ざいもく',
'じゃり',
'れんが',
'せめんと',
'しっくい',
'ぺんき',
'にす',
'どらいばー',
'ぺんち',
'はんだごて',
'でんりゅうけい',
'ほうき',
'ちりとり',
'はたき',
'ぞうきん',
'たわし',
'ごみ',
'なまごみ',
'かねんごみ',
'ふねんごみ',
'なまごみいれ',
'ごみばこ',
'ごみぶくろ',
'ばけつ',
'かんそうざい',
'さっちゅうざい',
'はえたたき',
'せんめんき',
'せんたくせっけん',
'ひょうはくざい',
'せんたくのり',
'せんたくばさみ',
'せんたくいた',
'ものほしだい',
'ものほしざお',
'おむつ',
'せっけん',
'せっけんうけ',
'すぽんじ',
'へちまたわし',
'かるいし',
'ぶらし',
'たおる',
'ばすたおる',
'たおるかけ',
'しゃんぷー',
'とりーとめんと',
'すーつ',
'えんびふく',
'たきしーど',
'ぶれざー',
'べすと',
'わいしゃつ',
'ぶらうす',
'てぃーしゃつ',
'せーたー',
'じーんず',
'ずぼん',
'はんずぼん',
'すかーと',
'きゅろっと',
'とらんくす',
'ぶりーふ',
'ぶらじゃー',
'ふんどし',
'くつした',
'ぱじゃま',
'ふだんぎ',
'ひらふく',
'せいふく',
'かわせいひん',
'すえーど',
'けがわ',
'ねくたい',
'ねくたいぴん',
'まふらー',
'てぶくろ',
'すかーふ',
'しょーる',
'べると',
'ふぁすなー',
'ぼたん',
'うらじ',
'ながぐつ',
'くつ',
'くつべら',
'さんだる',
'すりっぱ',
'ぼうし',
'きゃっぷ',
'べれーぼう',
'かつら',
'さてん',
'めん',
'きぬ',
'ようもう',
'ないろん',
'りねん',
'ぽりえすてる',
'あくせさりー',
'ゆびわ',
'いやりんぐ',
'ほうせき',
'ぶれすれっと',
'あんくれっと',
'ねっくれす',
'ぶろーち',
'かふすぼたん',
'けしょうひん',
'こうすい',
'しょうしゅうざい',
'くちべに',
'ろーしょん',
'ふぁんでーしょん',
'おしろい',
'ほおべに',
'まにきゅあ',
'ますから',
'くし',
'へあぶらし',
'かみそり',
'つめきり',
'みみかき',
'しょっきだな',
'とだな',
'たんす',
'ようふくだんす',
'ひきだし',
'きょうだい',
'ほんだな',
'たな',
'てーぶる',
'つくえ',
'そふぁー',
'いす',
'こしかけいす',
'じゅうたん',
'しきもの',
'べっど',
'かけぶとん',
'しきぶとん',
'もうふ',
'しーつ',
'まくら',
'ゆりかご',
'きんこ',
'しょうかき',
'かでんせいひん',
'れいぞうこ',
'れいとうこ',
'おーぶん',
'でんしれんじ',
'こんろ',
'たくじょうこんろ',
'ゆわかしき',
'みきさー',
'ふーどぷろせっさー',
'とーすたー',
'こーひーめーかー',
'じゅーさー',
'しょっきあらいき',
'せんたくき',
'かんそうき',
'そうじき',
'えあこん',
'せんぷうき',
'すとーぶ',
'かしつき',
'らじお',
'びでおでっき',
'あんぷ',
'どらいやー',
'でんち',
'たいようでんち',
'でんきゅう',
'けいこうとう',
'かいちゅうでんとう',
'こんせんと',
'やね',
'まるやね',
'かわら',
'ばるこにー',
'べらんだ',
'えんとつ',
'だんろ',
'あまどい',
'ひさし',
'もん',
'げんかん',
'うらぐち',
'しきい',
'どあ',
'ろうか',
'ゆか',
'あまど',
'まど',
'まどがらす',
'ぶらいんど',
'あみど',
'しょうじ',
'ふすま',
'てんじょう',
'はしら',
'かいだん',
'やねうら',
'ちかしつ',
'ちょぞうしつ',
'とこのま',
'おしいれ',
'いま',
'しょくどう',
'しょさい',
'しんしつ',
'ふろ',
'といれ',
'せんめんだい',
'ふろおけ',
'じゃぐち',
'だいどころ',
'ながしだい',
'ちょうりだい',
'みずきりだい',
'もとせん',
'かんきせん',
'にわ',
'うらにわ',
'しばふ',
'いけがき',
'かきね',
'しゃこ',
'ものおき',
'いけ',
'にわいし',
'にわき',
'さかなや',
'くすりや',
'くりーにんぐてん',
'ようふくや',
'ぶんぼうぐてん',
'めがねや',
'ほんや',
'おもちゃや',
'びよういん',
'ぎんこう',
'こんびに',
'ひゃっかてん',
'えれべーたー',
'えすかれーたー',
'すーぱー',
'しょっぴんぐせんたー',
'いちば',
'れすとらん',
'かふぇてりあ',
'さかば',
'いざかや',
'さかや',
'やたい',
'ほてる',
'やどや',
'おんせん',
'がっこう',
'ようちえん',
'しょうがっこう',
'ちゅうがっこう',
'こうこう',
'だいがく',
'びょういん',
'しんりょうじょ',
'けいさつしょ',
'しょうぼうしょ',
'ゆうびんきょく',
'としょかん',
'こうみんかん',
'はくぶつかん',
'びじゅつかん',
'すいぞくかん',
'どうぶつえん',
'げきじょう',
'うんどうじょう',
'きょうぎじょう',
'たいいくかん',
'やきゅうじょう',
'こうえん',
'べんち',
'ふんすい',
'じんじゃ',
'じいん',
'きょうかい',
'こうしゅうといれ',
'こうしゅうでんわ',
'でんわぼっくす',
'じどうはんばいき',
'げんきんじどうしはらいき',
'ゆうびんぽすと',
'ばーべきゅー',
'ごはん',
'おにぎり',
'すし',
'のりまき',
'ちらしずし',
'いなりずし',
'せきはん',
'くりごはん',
'おかゆ',
'ぞうすい',
'ぞうに',
'ちゃづけ',
'さけちゃづけ',
'もち',
'みそしる',
'つけもの',
'うめぼし',
'とうふ',
'ひややっこ',
'ゆどうふ',
'こうやどうふ',
'ゆば',
'おから',
'あぶらあげ',
'あつあげ',
'こんにゃく',
'しらたき',
'なっとう',
'さしみ',
'かつおのたたき',
'まぐろのやまかけ',
'やきざかな',
'あじのしおやき',
'ぶりのてりやき',
'さばのみそに',
'ぶりだいこん',
'かれいのにつけ',
'ざるそば',
'そば',
'うどん',
'そうめん',
'とんかつ',
'かつどん',
'ぎゅうどん',
'おやこどん',
'うなどん',
'てんどん',
'にくじゃが',
'かぼちゃのにもの',
'ちくぜんに',
'やきとり',
'からあげ',
'ぶたにくのしょうがやき',
'てんぷら',
'ちゃわんむし',
'あさりのさかむし',
'あつやきたまご',
'かまぼこ',
'ちくわ',
'はんぺん',
'おこのみやき',
'たこやき',
'やきそば',
'すきやき',
'しゃぶしゃぶ',
'おでん',
'しらあえ',
'いんげんのごまあえ',
'きゅうりとわかめのすのもの',
'ゆでたまご',
'はんじゅくたまご',
'めだまやき',
'すくらんぶるえっぐ',
'おとしたまご',
'かれーらいす',
'ころっけ',
'めんちかつ',
'えびふらい',
'かきふらい',
'さかなふらい',
'すぱげってぃ',
'はんばーぐ',
'みーとぼーる',
'おむれつ',
'おむらいす',
'ぴらふ',
'ぴざ',
'ぐらたん',
'まかろに',
'さらだ',
'こーるすろー',
'すーぷ',
'しちゅー',
'びーふしちゅー',
'おーとみーる',
'はんばーがー',
'ほっとどっく',
'さんどうぃっち',
'べーぐる',
'くろわっさん',
'がーりっくとーすと',
'すこーん',
'ろーすとちきん',
'ふらいどちきん',
'ふらいどぽてと',
'まりね',
'らーめん',
'ちゃーはん',
'ぎょうざ',
'しゅうまい',
'ちゃーしゅー',
'まーぼーどうふ',
'ほいこーろー',
'ればにらいため',
'ちんじゃおろーす',
'えびちり',
'ばんばんじー',
'ふかひれ',
'すぶた',
'はるまき',
'はるさめ',
'びーふん',
'にくまん',
'でざーと',
'あめ',
'わたあめ',
'あんこ',
'ぼたもち',
'だいふく',
'さくらもち',
'まんじゅう',
'だんご',
'くしだんご',
'いまがわやき',
'たいやき',
'もなか',
'おしるこ',
'ようかん',
'せんべい',
'かきごおり',
'けーき',
'ほっとけーき',
'わっふる',
'ぽっぷこーん',
'くっきー',
'くらっかー',
'しゅーくりーむ',
'どーなつ',
'ぱい',
'しゃーべっと',
'ぜりー',
'ぷりん',
'うえはーす',
'よーぐると',
'あいすくりーむ',
'あるこーるいんりょう',
'びーる',
'ういすきー',
'ばーぼん',
'わいん',
'あかわいん',
'しろわいん',
'ろぜわいん',
'しゃんぱん',
'かくてる',
'にほんしゅ',
'しょうちゅう',
'そふとどりんく',
'たんさんいんりょう',
'こーひー',
'こうちゃ',
'りょくちゃ',
'じゅーす',
'ぎゅうにゅう',
'ていしぼうにゅう',
'とうにゅう',
'こめ',
'おおむぎ',
'こむぎ',
'らいむぎ',
'こむぎこ',
'きょうりきこ',
'はくりきこ',
'ぜんりゅうふん',
'ぱんこ',
'ぱすた',
'めんるい',
'ぱん',
'みそ',
'あかみそ',
'しろみそ',
'くろみそ',
'はっちょうみそ',
'ぬかみそ',
'こめこうじ',
'さけかす',
'かんてん',
'かんぴょう',
'ひじき',
'べにしょうが',
'にゅうせいひん',
'れんにゅう',
'だっしにゅう',
'なまくりーむ',
'ほいっぷようくりーむ',
'ほいっぷくりーむ',
'さわーくりーむ',
'ちーず',
'ちぇだーちーず',
'もっつぁれら',
'たまご',
'なまたまご',
'らんおう',
'らんぱく',
'たまごのから',
'うずらたまご',
'にく',
'ぎゅうにく',
'こうしのにく',
'ぶたにく',
'ひつじにく',
'こひつじのにく',
'とりにく',
'しちめんちょうにく',
'かもにく',
'しかにく',
'ばにく',
'あかみ',
'あぶらみ',
'しもふり',
'ひれにく',
'ろーすにく',
'ばらにく',
'ひきにく',
'こまにく',
'ぶたこま',
'ぶたろーす',
'ぶたばら',
'ほねつきぶたばら',
'ぶたもも',
'ぎゅうかたばら',
'ぎゅうかたろーす',
'りぶろーす',
'さーろいん',
'ぎゅうもも',
'たん',
'ればー',
'とりむね',
'とりもも',
'ささみ',
'てばさき',
'ほねつきすねにく',
'すなぎも',
'はつ',
'ひなばと',
'ふぉあぐら',
'そーせーじ',
'ちょりそ',
'はむ',
'べーこん',
'ぱんちぇった',
'さらみ',
'れーずん',
'あなうんさー',
'あにめーたー',
'あるばいと',
'いし',
'いしく',
'いたまえ',
'いものこう',
'いらすとれーたー',
'いんてりあでざいなー',
'うえいたー',
'うえいとれす',
'うぇぶでざいなー',
'うかい',
'うちゅうひこうし',
'うらないし',
'うんてんしゅ',
'えいがかんとく',
'えいようし',
'えきいん',
'えすててぃしゃん',
'えほんさっか',
'えんかかしゅ',
'えんじにあ',
'えんしゅつか',
'おてつだいさん',
'おんがくか',
'かいけいし',
'かいせつしゃ',
'がいこうかん',
'かうんせらー',
'かいじょうほあんかん',
'がか',
'がくげいいん',
'がくしゃ',
'かしや',
'かじや',
'かしゅ',
'かじん',
'かせいふ',
'かていきょうし',
'かめらまん',
'がらすこう',
'がんかい',
'かんごし',
'かんとく',
'かんりょう',
'きかいこう',
'きかんし',
'ぎいん',
'こっかいぎいん',
'ぎたりすと',
'きゃくほんか',
'きょうせいしかい',
'きしゅ',
'ぎじゅつしゃ',
'きゃくしつじょうむいん',
'きゅうきゅうきゅうめいし',
'きゅうし',
'きょうし',
'ぎょうしょうにん',
'ぎょうせいかん',
'ぎょうせいしょし',
'ぎんこういん',
'ぐらふぃっくでざいなー',
'ぐんじん',
'けいえいしゃ',
'けいえいこんさるたんと',
'けいさつかん',
'けいびいん',
'けいむかん',
'げいにん',
'げいじゅつか',
'けいせいげかい',
'げかい',
'げきさっか',
'けんさつかん',
'けんしゅうい',
'けんちくし',
'こうかいし',
'こうくうかんせいかん',
'こうだんし',
'こうむいん',
'こっく',
'こめでぃあん',
'こぴーらいたー',
'こんさるたんと',
'さいばんかん',
'さかん',
'さっか',
'さっかーせんしゅ',
'さくしか',
'さっきょくか',
'さんふじんかい',
'さらりーまん',
'じえいかん',
'じえいぎょう',
'しかいしゃ',
'しかいし',
'しかぎこうし',
'しきしゃ',
'ししょ',
'しじん',
'しすてむえんじにあ',
'したてや',
'しちや',
'じつぎょうか',
'しつじ',
'しなりおらいたー',
'じびいんこうかい',
'しほうしょし',
'じむいん',
'じゃーなりすと',
'しゃいん',
'しゃしょう',
'しゃしんか',
'じゅういし',
'しょうせつか',
'しょうぼうかん',
'しょうにかい',
'しょくにん',
'しょか',
'じょさんぷ',
'しんぶんきしゃ',
'しんぶんはいたついん',
'しんぱん',
'せいじか',
'せいびし',
'ずいひつか',
'すたいりすと',
'すたんとまん',
'すぽーつせんしゅ',
'すり',
'せーるすまん',
'せいがくか',
'せいけいげかい',
'せいゆう',
'せんいん',
'せんすいし',
'そっきし',
'しゅうきょうか',
'せいたいし',
'ぜいりし',
'そうばし',
'そうりょ',
'そっきしゃ',
'そくりょうし',
'そむりえ',
'だいく',
'たいぴすと',
'たくしーうんてんしゅ',
'たんけんか',
'だんさー',
'たんてい',
'ちょうきょうし',
'ちょうりし',
'ちょうりつし',
'ちょうこくか',
'つうかんし',
'つうしんし',
'つうやく',
'でぃーらー',
'でぃれくたー',
'でざいなー',
'てれびたれんと',
'でんきこう',
'てんじょういん',
'つあーこんだくたー',
'とうげいか',
'とうしあなりすと',
'とうしか',
'とざんか',
'とこや',
'とび',
'なれーたー',
'ないかい',
'にくや',
'にほんごきょうし',
'にゅーすきゃすたー',
'にわし',
'のうか',
'ばーてんだー',
'はいかんこう',
'はいじん',
'ばいやー',
'はいゆう',
'ぱいろっと',
'ばすがいど',
'はつめいか',
'はなや',
'はりし',
'ばれえだんさー',
'ぱんや',
'ぴあにすと',
'ひしょ',
'ひふかい',
'びようし',
'ひょうろんか',
'ふぁっしょんでざいなー',
'ふどうさん',
'ぷろぐらま',
'ぷろでゅーさー',
'べびーしったー',
'べんごし',
'へんしゅうしゃ',
'べんりし',
'ほあんかん',
'ほうしゃせんぎし',
'ほうどうきしゃ',
'ぼくじょうけいえいしゃ',
'ほぼ',
'ほんやくか',
'まっさーじし',
'まんがか',
'めいど',
'もでる',
'やきゅうせんしゅ',
'やくざいし',
'ゆうびんはいたついん',
'ようせつこう',
'らくのうか',
'りょこうだいりてんいん',
'りょうし',
'れきしか',
'るぽらいたー',
'れーしんぐどらいばー',
'わがししょくにん',
'しゃちょう',
'まりお',
'るいーじ',
'ぴーちひめ',
'くっぱ',
'てれさ',
'ぱっくんふらわー',
'げっそー',
'くりぼー',
'のこのこ',
'りんく',
'わりお',
'かーびぃ',
'ぴかちゅう',
'どらごんくえすと',
'ふぁいなるふぁんたじー',
'ばいおはざーど',
'びーとまにあ',
'ろっくまん',
'ふぁみこん',
'すーぱーふぁみこん',
'げーむぼーい',
'げーむぼーいからー',
'げーむぼーいあどばんす',
'げーむぎあ',
'ぴーしーえんじん',
'めがどらいぶ',
'さたーん',
'ぷれいすてーしょん',
'ろくよん',
'ばーちゃるぼーい',
'げーむきゅーぶ',
'うぃー',
'えっくすぼっくす',
'ぴーしーえふえっくす',
'でぃーえす',
'さざえさん',
'いそのかつお',
'いそのわかめ',
'ますおさん',
'なみへい',
'あなごさん',
'こぼちゃん',
'どらえもん',
'のびた',
'しずちゃん',
'すねお',
'じゃいあん',
'どらごんぼーる',
'ゆうゆうはくしょ',
'すらむだんく',
'るろうにけんしん',
'せいんとせいや',
'ほくとのけん',
'じょじょのきみょうなぼうけん',
'こちらかつしかくかめありこうえんまえはしゅつじょ',
'ごるごさーてぃーん',
'おばけのきゅーたろう',
'えすぱーまみ',
'こいけさん',
'ぷろごるふぁーさる',
'はっとりくん',
'きてれつだいひゃっか',
'ころすけ',
'がらすのかめん',
'てつわんあとむ',
'じゃんぐるたいてい',
'ぶらっくじゃっく',
'りぼんのきし',
'どらきゅら',
'ふらんけんしゅたいん',
'おおかみおとこ',
'げげげのきたろう',
'いったんもめん',
'こなきじじい',
'すなかけばばあ',
'ぬりかべ',
'ねこむすめ',
'ぬらりひょん',
'めだまのおやじ',
'ねずみおとこ',
'きゅうけつき',
'ざしきわらし',
'ゆきおんな',
'かさおばけ',
'あずきあらい',
'のっぺらぼう',
'かぜのたにのなうしか',
'てんくうのしろらぴゅた',
'るぱんさんせい',
'まじょのたっきゅうびん',
'となりのととろ',
'くれないのぶた',
'もののけひめ',
'せんとちひろのかみかくし',
'はうるのうごくしろ',
'がけのうえのぽにょ',
'ぱとれいばー',
'てつじんにじゅうはちごう',
'まじんがーぜっと',
'げったーろぼ',
'がんだむ',
'ざく',
'ぐふ',
'じおんぐ',
'まくろす',
'がおがいがー',
'えう゛ぁんげりおん',
'おいしんぼ',
'あかしやさんま',
'びーとたけし',
'ところじょーじ',
'たもり',
'すまっぷ',
'しまだしんすけ',
'ひかわきよし',
'きたじまさぶろう',
'ひさもとまさみ',
'わだあきこ',
'やまだはなこ',
'なかまゆきえ',
'くろやなぎてつこ',
'じゃいあんとばば',
'あんとにおいのき',
'がっついしまつ',
'まつざきしげる',
'たけだてつや',
'てづかおさむ',
'みとこうもん',
'ひっさつしごとにん',
'とおやまのきんさん',
'ももたろうざむらい',
'さかなくん',
'えなりかずき',
'だうんたうん',
'ないんてぃないん',
'うっちゃんなんちゃん',
'ばくしょうもんだい',
'えがしらにじごじゅっぷん',
'きょろちゃん',
'あんぱんまん',
'きてぃちゃん',
'とっとこはむたろう',
'かめんらいだー',
'うるとらまん',
'うるとらせぶん',
'うるとらのちち',
'うるとらのはは',
'うるとらまんたろう',
'ふらんだーすのいぬ',
'ははをたずねてさんぜんり',
'あらいぐまらすかる',
'あかげのあん',
'ぴーたーぱん',
'あしながおじさん',
'めいけんらっしー',
'じゃいあんつ',
'どらごんず',
'べいすたーず',
'すわろーず',
'かーぷ',
'たいがーす',
'だいえーほーくす',
'らいおんず',
'にっぽんはむふぁいたーず',
'おりっくすばっふぁろーず',
'ちばろってまりーんず',
'そふとばんくほーくす',
'らくてんごーるでんいーぐるす',
'ちゅうごく',
'いんど',
'あめりか',
'いんどねしあ',
'ぶらじる',
'ろしあ',
'にっぽん',
'かなだ',
'いぎりす',
'どいつ',
'ふらんす',
'すいす',
'おらんだ',
'いたりあ',
'おーすとらりあ',
'すぺいん',
'ぎりしゃ',
'しんがぽーる',
'たい',
'たいわん',
'とるこ',
'めきしこ',
'あふりか',
'えべれすと',
'ちょもらんま',
'きりまんじゃろ',
'ふじさん',
'ちょこれーと',
'ぽてとちっぷす',
'すなっくがし',
'するめ',
'ぽっきー',
'かっぱえびせん',
'こーら',
'あーるえっくすせぶん',
'いんぷれっさ',
'らんさーえぼりゅーしょん',
'じーてぃーあーる',
'えぬえすえっくす',
'はっちばっく',
'くーぺ',
'えすゆーぶい',
'ふぇらーり',
'にっさん',
'ほんだ',
'とよた',
'まつだ',
'みつびし',
'すばる',
'すずき',
'だいはつ',
'でぃーたんし',
'えすたんし',
'こんぽーねんとたんし',
'こんぽじっとたんし',
'ちでじ',
'すぴーかー',
'てれび',
'れこーだー',
'あーるじーびー',
'みにじゃっく',
'せんとくん',
'まんとくん',
'ちーばくん',
'てんき',
'てんきよほう',
'しぜんさいがい',
'きおん',
'さいこうきおん',
'さいていきおん',
'へいきんきおん',
'きあつ',
'きあつはいち',
'こうきあつ',
'ていきあつ',
'しつど',
'こうすいかくりつ',
'こうすいりょう',
'かいせい',
'はれ',
'くもり',
'とおりあめ',
'にわかあめ',
'ゆうだち',
'こさめ',
'おおあめ',
'ぼうふうう',
'すこーる',
'ゆき',
'ふぶき',
'ぼうふうせつ',
'あられ',
'きりさめ',
'しも',
'つゆ',
'こおり',
'つらら',
'らいう',
'かみなり',
'いなびかり',
'かぜ',
'そよかぜ',
'きょうふう',
'とっぷう',
'あらし',
'すなあらし',
'たつまき',
'たいふう',
'はりけーん',
'さいくろん',
'しゅんかんさいだいふうそく',
'きせつふう',
'ぼうえきふう',
'こうずい',
'だいこうずい',
'かんばつ',
'まんちょう',
'かんちょう',
'あかしお',
'なみ',
'おおなみ',
'つなみ',
'じしん',
'ふんか',
'じすべり',
'ゆうやけ',
'にじ',
'おーろら',
'しんきろう',
'せいでんき',
'もや',
'にっしょく',
'げっしょく',
'まんげつ',
'みかづき',
'ひので',
'にちぼつ',
'じてん',
'こうてん',
'おぞんそう',
'おぞんほーる',
'ちきゅうおんだんか',
'おんしつこうか',
'おんどけい',
'しつどけい',
'きあつけい',
'ふうそくけい',
'じしんけい',
'せきどう',
'たいりく',
'ゆーらしあたいりく',
'あふりかたいりく',
'ほくべいたいりく',
'なんべいたいりく',
'なんきょく',
'こうち',
'ていち',
'しま',
'やま',
'さんみゃく',
'ひまらやさんみゃく',
'あるぷすさんみゃく',
'ろっきーさんみゃく',
'ひださんみゃく',
'ひょうが',
'ひょうざん',
'かざん',
'かつかざん',
'きゅうかざん',
'さんちょう',
'おね',
'だいきょうこく',
'ぐらんどきゃにおん',
'きょうこく',
'ぼんち',
'いわ',
'おか',
'どて',
'だいどうくつ',
'どうくつ',
'ほらあな',
'さばく',
'さはらさばく',
'すなち',
'こうや',
'ぬま',
'どろ',
'しっち',
'じゃんぐる',
'みつりん',
'しんりん',
'ぼくそうち',
'そうげん',
'のはら',
'たいへいよう',
'たいせいよう',
'いんどよう',
'ほっきょくかい',
'ちちゅうかい',
'にほんかい',
'おほーつくかい',
'ひがししなかい',
'くろしお',
'おやしお',
'さんごしょう',
'あんしょう',
'みさき',
'はんとう',
'いずはんとう',
'とうきょうわん',
'かいきょう',
'すいろ',
'うんが',
'かいこう',
'にほんかいこう',
'かいがん',
'うみべ',
'はまべ',
'すなはま',
'あさせ',
'きし',
'すいへいせん',
'ちへいせん',
'みずうみ',
'かすぴかい',
'びわこ',
'かわ',
'ないるがわ',
'おがわ',
'たき',
'ないあがらのたき',
'だむ',
'おあしす',
'ほっきょくてん',
'なんきょくてん',
'うちゅう',
'わくせい',
'ちきゅう',
'たいよう',
'つき',
'きんせい',
'かせい',
'もくせい',
'どせい',
'てんのうせい',
'かいおうせい',
'めいおうせい',
'おひつじざ',
'おうしざ',
'ふたござ',
'かにざ',
'ししざ',
'おとめざ',
'てんびんざ',
'さそりざ',
'いてざ',
'やぎざ',
'みずがめざ',
'うおざ',
'あまのがわ',
'ほくとしちせい',
'すいせい',
'えいせい',
'じんこうえいせい',
'きしょうえいせい',
'つうしんえいせい',
'じゅうりょく',
'ひょうこう',
'ちず',
'かいず',
'らしんばん',
'ほいくえん',
'だんしこう',
'じょしこう',
'よびこう',
'こうしゃ',
'こうてい',
'こうどう',
'ぶどうじょう',
'じゅうどうじょう',
'けんどうじょう',
'きゅうどうじょう',
'ちゃしつ',
'ぷーる',
'てにすこーと',
'がくせいりょう',
'ぶしつ',
'てつぼう',
'ぶらんこ',
'すべりだい',
'すなば',
'しーそー',
'かだん',
'ひゃくようばこ',
'きょうしつ',
'しょくいんしつ',
'じむしつ',
'こうちょうしつ',
'りかしつ',
'びじゅつしつ',
'おんがくしつ',
'ちょうりしつ',
'としょしつ',
'しちょうかくしつ',
'ほけんしつ',
'ぶんぼうぐ',
'ふでばこ',
'まじっくぺん',
'くれよん',
'がようし',
'ものさし',
'てんびん',
'しけんかん',
'けんびきょう',
'ちきゅうぎ',
'ぼうえんきょう',
'けいさんき',
'きょうかしょ',
'さんこうしょ',
'じしょ',
'ちずちょう',
'こくばん',
'ちょーく',
'こくばんけし',
'こうしょう',
'がくせいしょう',
'たいそうぎ',
'じゃーじ',
'みずぎ',
'さんすう',
'すうがく',
'きかがく',
'だいすうがく',
'とうけいがく',
'こてん',
'ようむいん',
'しゅえい',
'せいと',
'がっきゅういいん',
'しょうがくせい',
'せんぱい',
'こうはい',
'きょういくじっしゅうせい',
'じゅぎょう',
'じかんわり',
'しゅっせきぼ',
'しゅくだい',
'よしゅう',
'ふくしゅう',
'かんさつ',
'けんきゅう',
'じっけん',
'じっしゅう',
'さくぶん',
'れぽーと',
'せいせき',
'つうしんぼ',
'ないしんしょ',
'せいせきしょうめいしょ',
'しけんけっか',
'しけん',
'じつぎしけん',
'たいりょくしけん',
'けんこうしんだん',
'もぎしけん',
'ちゅうかんしけん',
'きまつしけん',
'がくねんまつしけん',
'にゅうがくしけん',
'せんたーしけん',
'てんこう',
'こうそく',
'がっき',
'がくねんど',
'うんどうかい',
'ぶんかさい',
'えんそく',
'どうそうかい',
'そつぎょうしき',
'そつぎょうろんぶん',
'そつぎょうしょうしょ',
'そつぎょうあるばむ',
'ひげそり',
'てぃっしゅ',
'はんがー',
'あまぐ',
'かっぱ',
'かーてん',
'めざましどけい',
'らばーかっぷ',
'りんす',
'こんでぃしょなー',
'はみがきこ',
'はぶらし',
'きゅうす',
'なべ',
'ぼうる',
'さしみぼうちょう',
'ぺてぃないふ',
'つまようじ',
'いんせき',
'ろーるぱん',
'しょくぱん',
'あんぱん',
'じゃむぱん',
'うぐいすぱん',
'むしぱん',
'ちーずむしぱん',
'さんどいっち',
'はむさんど',
'とまとさんど',
'たまごさんど',
'びーえるてぃーさんど',
'ほっとさんど',
'かつさんど',
'ころっけぱん',
'しゃこうだんす',
'ぶれいくだんす',
'こさっくだんす',
'じゃずだんす',
'すとりーとだんす',
'たっぷだんす',
'ふらめんこ',
'べりーだんす',
'おしょうがつ',
'せいじんしき',
'せつぶん',
'ひなまつり',
'おはなみ',
'こどものひ',
'なつまつり',
'たなばた',
'くりすます',
'おおみそか',
'いちごじゃむ',
'ぶるーべりーじゃむ',
'ぴーなっつくりーむ',
'つぶあん',
'こしあん',
'かがみもち',
'はねつき',
'こま',
'きもの',
'ゆかた',
'ささ',
'たんざく',
'なまはげ',
'くりすますけーき',
'としこしそば',
'こいのぼり',
'ひなだん',
'ひなあられ',
'あまざけ',
'ごがつにんぎょう',
'くりすますつりー',
'さんたくろーす',
'ぷれぜんと',
'はつでんしょ',
'かりょくはつでんしょ',
'げんしりょくはつでんしょ',
'ふうりょくはつでんしょ',
'おてら',
'おはか',
'すーぱーまーけっと',
'こぶとりじいさん',
'ももたろう',
'きんたろう',
'うらしまたろう',
'はなさかじいさん',
'さるかにがっせん',
'いっすんぼうし',
'したきりすずめ',
'かさじぞう',
'おむすびころりん',
'かちかちやま',
'つるのおんがえし',
'いなばのしろうさぎ',
'ねぶそく',
'ようつう',
'かたこり',
'めまい',
'いきぎれ',
'しんけいつう',
'かんせつつう',
'ふくざつこっせつ',
'ぺんたぶれっと',
'まうす',
'きーぼーど',
'りもこん',
'でじたるかめら',
'げーむぱっど',
'ゆーえすびーけーぶる',
'ゆーえすびーめもり',
'はーどでぃすく',
'ふろっぴーでぃすく',
'でぃーぶいでぃーどらいぶ',
'しーでぃーどらいぶ',
'ぶるーれいでぃすくどらいぶ',
'めもりーかーどりーだー',
'えきしょうもにた',
'ぷりんた',
'すきゃな',
'あいぽっど',
'いやほん',
'へっどほん',
'るーた',
'はぶ',
'とらっくぼーる',
'びんぼう',
'おかねもち',
'おりんぴっく',
'わーるどかっぷ',
'てじな',
'じゃぐりんぐ',
'おてだま',
'ぺんまわし',
'ゆびぱっちん',
'かーどまじっく',
'こいんまじっく',
'ろーぷまじっく',
'くろーすあっぷまじっく',
'すてーじまじっく',
'えびぞり',
'くっしんうんどう',
'ぜんくつ',
'はんぷくよことび',
'すいちょくとび',
'ふみだいしょうこう',
'すとれっち',
'とざん',
'ごるふ',
'ろっくくらいみんぐ',
'ぐらいだー',
'すかいだいびんぐ',
'ねつききゅう',
'つり',
'さーふぃん',
'ぼでぃーぼーど',
'うぃんどさーふぃん',
'すきゅーばだいびんぐ',
'すいじょうすきー',
'けいば',
'すもう',
'じゅうどう',
'からて',
'じゅうじゅつ',
'てこんどー',
'あいきどう',
'むえたい',
'たいきょくけん',
'ちゅうごくけんぽう',
'しょうりんじけんぽう',
'ほくとしんけん',
'なんとせいけん',
'ぼくしんぐ',
'けんどう',
'ふぇんしんぐ',
'いあい',
'ばんじーじゃんぷ',
'すけーとぼーど',
'すのーぼーど',
'とらいあすろん',
'けいりん',
'まうんてんばいく',
'ろーどれーす',
'しゃげき',
'あーちぇりー',
'きゅうどう',
'くれーしゃげき',
'びりやーど',
'だーつ',
'くろーる',
'ひらおよぎ',
'ばたふらい',
'しんくろないずどすいみんぐ',
'たちおよぎ',
'くろすかんとりー',
'もーぐる',
'えありある',
'ばいあすろん',
'ふぃぎゅあすけーと',
'すぴーどすけーと',
'あいすほっけー',
'ろーらーすけーと',
'かーりんぐ',
'しんたいそう',
'えあろびくす',
'ふぃっとねす',
'とらんぽりん',
'ばとんとわりんぐ',
'あめりかんふっとぼーる',
'えきでん',
'げーとぼーる',
'さっかー',
'ふっとさる',
'すいきゅう',
'せぱたくろー',
'そふとぼーる',
'どっじぼーる',
'ばすけっとぼーる',
'ばれーぼーる',
'びーちばれー',
'やきゅう',
'らぐびー',
'らくろす',
'ぼでぃーびる',
'ぼでぃーびるだー',
'ぱわーりふてぃんぐ',
'じゅうりょうあげ',
'つなひき',
'ちぇす',
'しょうぎ',
'いご',
'まーじゃん',
'いーすぽーつ',
'ばどみんとん',
'てにす',
'そふとてにす',
'たっきゅう',
'すかっしゅ',
'びんた',
'おうふくびんた',
'しっぺ',
'ぱんち',
'きっく',
'ぺこちゃん',
'さんりお',
'はろーきてぃ',
'まいめろでぃ',
'そうこばん',
'るーびっくきゅーぶ',
'くろすわーどぱずる',
'いらすとろじっく',
'つめしょうぎ',
'すーぱーぼーる',
'びーだま',
'ふぁーびー',
'ふうせん',
'ぶーめらん',
'ふらふーぷ',
'れごぶろっく',
'べーごま',
'ほっぴんぐ',
'ぼとるきゃっぷ',
'がしゃぽん',
'かみねんど',
'かみひこうき',
'きっくぼーど',
'こどもぎんこうけん',
'さいころ',
'ままごと',
'めんこ',
'もぐらたたき',
'わらいぶくろ',
'はりせん',
'おかもち',
'おんさ',
'かいらんばん',
'かみふぶき',
'ぎろちん',
'くうきいれ',
'くさび',
'すたんがん',
'といし',
'せんす',
'そろばん',
'ちゅうせんき',
'ちょうしんき',
'つえ',
'つるはし',
'てつぱいぷ',
'ぴっける',
'ひばし',
'ぴんせっと',
'ほーす',
'まうすぴーす',
'まごのて',
'ます',
'みみせん',
'くすだま',
'けいさんじゃく',
'ばーこーど',
'ぱいぷいす',
'とらばさみ',
'むすびめ',
'わごん',
];
const recentlySelectedWords = [];
let painterIndex = -1;
let currentWord = null;
let gameEndTime = null;
let gameTimeoutObserver = null;
let revealLengthTimeouter = null;
let revealPrefixTimeouter = null;
let revealSuffixTimeouter = null;

app.use(express.static(__dirname + '/../client'));

app.ws('/', (ws, req) => {
  ws.on('message', (msg) => {
    let decoded = null;
    try {
      decoded = JSON.parse(msg);
    } catch(e) {
      return;
    }
    console.log(decoded);
    switch (decoded.ev) {
    case 'join':
      let isNgName = decoded.name === 'SYSTEM' || decoded.name === '' || decoded.name === null;
      for (let player of players) {
        isNgName = isNgName || (player.name === decoded.name);
      }
      if (isNgName) {
        sendOne(ws, error('この名前は使用できません。ブラウザをリロードして再試行してください'));
        return;
      }
      players.push(new Player(ws, decoded.name));
      sendScoreBoard(decoded.name + 'さんが入室しました');
      if (players.length < kMinPlayerCount) {
        fanOut(systemMessage(kMinPlayerCount + '人あつまるまでお待ちください。'));
      } else if (players.length === kMinPlayerCount) {
        fanOut(systemMessage('最低履行人数があつまりました。'));
        waitChangePainter(0);
      } else {
        sendOne(ws, systemMessage('次のゲームから参加してください'));
      }
      break;
    case 'textMessage':
      let answerer = null;
      for (let p of players) {
        if (p.ws === ws) {
          answerer = p;
          break;
        }
      }
      if (answerer === players[painterIndex]) {
        decoded.msg = decoded.msg.replace(currentWord, '○○○');
      }
      fanOut(decoded);
      if (answerer !== players[painterIndex] && decoded.msg === currentWord) {
        if (answerer === null) {
          console.error('Unexpected: no answerer');
          return;
        }
        let point = Math.round((gameEndTime - Date.now()) / 1000);
        stopGameTimer();
        stopRevealer();

        fanOut(endTimer());
        fanOut(setSubject(currentWord));
        fanOut(systemMessage(answerer.name + ' が正解！「' + currentWord + '」+ ' + point + '点'));
        fanOut(systemMessage('絵を描いた人 ' + answerer.name + ' + ' + point + '点'));
        fanOut(sendScoreBoard(''));
        fanOut(audio('ok'));
        waitChangePainter((painterIndex + 1) % players.length);
      }
      break;
    case 'paintEvent':
      if (painterIndex >= 0 && painterIndex < players.length) {
        let painter = players[painterIndex];
        if (painter.ws === ws) {
          fanOut(decoded);
        }
      }
      break;
    }
  });

  ws.isAlive = true;
  ws.on('pong', heartbeat);
  ws.on('error', () => { disconnect(ws); });
  ws.on('close', () => { disconnect(ws); });
});

class Player {
  constructor(ws, name) {
    this.ws = ws;
    this.name = name;
    this.point = 0;
  }
}

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

const interval = setInterval(function ping() {
  expressWs.getWss().clients.forEach(function each(ws) {
    if (ws.isAlive === false || ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) {
      disconnect(ws);
      ws.terminate();
      return;
    }
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 5000);

function disconnect(ws) {
  let i = 0;
  for (i = 0; i < players.length; i++) {
    if (players[i].ws === ws) { break; }
  }
  if (i >= players.length) { return; }
  let disconnectedPlayer = players.splice(i, 1)[0];
  fanOut(systemMessage(disconnectedPlayer.name + 'さんが退出しました。'));
  if (i === painterIndex) {
    stopRevealer();

    fanOut(systemMessage('絵師が退出したため、次のお題に移動します。今のお題は「' + currentWord + '」でした。'));
    fanOut(endTimer());
    waitChangePainter(painterIndex);
  }
}

function waitChangePainter(nextPainterIndex) {
  fanOut(systemMessage('5秒後に次のゲームが始まります'));
  setTimeout(() => { changePainter(nextPainterIndex); }, 5000);
}

function sendScoreBoard(prefix) {
  let msg = prefix + '現在の得点:';
  for (let p of players) {
    msg += ' ' + p.name + 'さん ' + p.point + '点';
  }
  fanOut(systemMessage(msg));
}

function changePainter(nextPainterIndex) {
  painterIndex = nextPainterIndex;
  let painter = players[painterIndex];
  let nextWord = selectWord();
  currentWord = nextWord;

  fanOut({'ev': 'ctrl', 'cmd': 'clear'});
  fanOutOtherThan(painter.ws, {'ev': 'ctrl', 'cmd': 'role', 'role': 'answerer'});
  sendOne(painter.ws, {'ev': 'ctrl', 'cmd': 'role', 'role': 'painter'});
  fanOut(systemMessage(painter.name + ' の番です！絵を描いてください（お題の文字を書いてはいけません）'));
  fanOut(systemMessage('他の人は ' + painter.name + ' の描いた絵をひらがなで発言してください'));

  sendOne(painter.ws, setSubject(nextWord));
  fanOutOtherThan(painter.ws, setSubject('？？？'));
  sendOne(painter.ws, systemMessage('お題: ' + nextWord));

  fanOut(startTimer(gameTimeout));
  startGameTimer();
  startRevealer();
  fanOut(startTimer(gameTimeout));
  fanOut(audio('question'));
}

function selectWord() {
  cleanUpRecentlySelectedWords();
  while (true) {
    let idx = (Math.random() * dictionary.length) | 0;
    let word = dictionary[idx];
    let isUsed = false;
    for (let rsw of recentlySelectedWords) {
      isUsed = isUsed || rsw.word === word;
      if (isUsed) break;
    }
    if (!isUsed) {
      recentlySelectedWords.push({word: word, usedTimeMs: Date.now()});
      return word;
    }
  }
}

function startGameTimer() {
  stopGameTimer();

  gameEndTime = Date.now() + gameTimeout;
  gameTimeoutObserver = setTimeout(() => {
    stopGameTimer();
    endGameByTimeLimit();
  }, gameTimeout);
}

function stopGameTimer() {
  if (gameTimeoutObserver !== null) {
    clearTimeout(gameTimeoutObserver);
    gameTimeoutObserver = null;
  }
}

function startRevealer() {
  stopRevealer();

  revealLengthTimeouter = setTimeout(() => {
    fanOutOtherThan(players[painterIndex].ws, setSubject('○'.repeat(currentWord.length)));
  }, revealLengthTime);

  revealPrefixTimeouter = setTimeout(() => {
    let revealLength = currentWord.length >= 10 ? 2 : 1;
    let revealedSubject = currentWord.substr(0, revealLength) + '○'.repeat(currentWord.length - revealLength);
    fanOutOtherThan(players[painterIndex].ws, setSubject(revealedSubject));
  }, revealPrefixTime);

  revealSuffixTimeouter = setTimeout(() => {
    var revealLength;
    if (currentWord.length >= 10) {
      revealLength = 2;
    } else if (currentWord.length >= 3) {
      revealLength = 1;
    } else {
      revealLength = 0;
    }
    let revealedSubject =
      currentWord.substr(0, revealLength) +
      '○'.repeat(currentWord.length - (2 * revealLength)) +
      currentWord.substr(-revealLength, revealLength);
    fanOutOtherThan(players[painterIndex].ws, setSubject(revealedSubject));
  }, revealSuffixTime);
}

function stopRevealer() {
  if (revealLengthTimeouter !== null) {
    clearTimeout(revealLengthTimeouter);
    revealLengthTimeouter = null;
  }
  if (revealPrefixTimeouter !== null) {
    clearTimeout(revealPrefixTimeouter);
    revealPrefixTimeouter = null;
  }
  if (revealSuffixTimeouter !== null) {
    clearTimeout(revealSuffixTimeouter);
    revealSuffixTimeouter = null;
  }
}

function endGameByTimeLimit() {
  fanOut(endTimer());
  fanOut(systemMessage('時間切れ！正解者は居ませんでした 「' + currentWord + '」'));
  fanOut(audio('ng'));

  currentWord = null;
  waitChangePainter((painterIndex + 1) % players.length);
}

function cleanUpRecentlySelectedWords() {
  const newList = [];
  const thresholdTimeMs = Date.now() - 24 * 60 * 60 * 1000;
  for (let w of recentlySelectedWords) {
    if (w.usedTimeMs >= thresholdTimeMs) {
      newList.push(w);
    }
  }
  recentlySelectedWords.splice(0);
  recentlySelectedWords.push(...newList);
}

function error(msg) {
  return {'ev': 'error', 'msg': msg};
}

function systemMessage(msg) {
  return {'ev': 'textMessage', 'name': 'SYSTEM', 'msg': msg};
}

function setSubject(subject) {
  return {'ev': 'setSubject', 'subject': subject};
}

function startTimer(timeLimit) {
  return {'ev': 'startTimer', 'timeLimit': timeLimit};
}

function endTimer() {
  return {'ev': 'endTimer'};
}

function audio(id) {
  return {'ev': 'audio', 'id': id};
}

function fanOut(msg) {
  const fanOutMessageString = JSON.stringify(msg);
  expressWs.getWss().clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(fanOutMessageString);
    }
  });
}

function fanOutOtherThan(ws, msg) {
  const fanOutMessageString = JSON.stringify(msg);
  expressWs.getWss().clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(fanOutMessageString);
    }
  });
}

function sendOne(ws, msg) {
  if (ws.readyState === WebSocket.OPEN) {
    const string = JSON.stringify(msg);
    ws.send(string);
  }
}

app.listen(9898);
