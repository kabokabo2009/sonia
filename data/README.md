# 更新のしかた

ニュース・ライブ・ギャラリーは、このフォルダの JSON ファイルを書き換えるだけで更新できます。
テキストエディタ（VS Code など）で開き、既存のかたまり `{ ... }` をコピーして中身を書き換えてください。
かたまりの間には必ず `,`（カンマ）を入れ、最後のかたまりの後ろにはカンマを付けません。

## news.json

| 項目 | 内容 |
| --- | --- |
| id | 記事番号（重複しない数字。新しい記事ほど大きい数字にすると分かりやすいです） |
| date | 日付（`2026.10.18` の形式）。新しい順に自動で並びます |
| category | ラベル（Info / Live / Release / Media / Goods など自由。タブが自動で増えます） |
| title | タイトル |
| body | 本文。書くと詳細ページ（news/detail/?id=番号）が作られます。改行は `\n`、空行（`\n\n`）で段落が分かれます |
| image | 詳細ページに載せる画像（任意。例：`images/news/xxx.jpg`） |
| links | 詳細ページ下に出すボタン（任意）。`[{ "label": "Live detail", "url": "live/detail/?id=1" }]` |
| url | 外部リンク（body が無いときだけ使われ、別タブで開きます） |
| link | ページ内リンク（body が無いときだけ使われます。例：`#live`） |

body も url も link も無い場合は、クリックできない一行になります。
トップには最初の5件が表示され、それ以上は「View all」で開きます。

## live.json

| 項目 | 内容 |
| --- | --- |
| id | 公演番号（重複しない数字）。詳細ページは live/detail/?id=番号 |
| date | 公演日（`2026-11-14` の形式） |
| title | 公演タイトル |
| area / venue | エリア / 会場名 |
| venueUrl | 会場サイトのURL（任意。会場名がリンクになります） |
| address | 会場住所（任意） |
| open / start | 開場 / 開演 |
| price | 料金 |
| ticket | チケットURL（無ければボタンは出ません） |
| detail | 詳細ページの本文（任意。改行は `\n`） |
| image | フライヤー画像（任意。例：`images/live/xxx.jpg`） |

日付が過ぎた公演は自動で「Past」に移動し、詳細ページには「Finished」と表示されます。

## gallery.json

TOPの GALLERY には上から5件、ギャラリーページ（gallery/）には全件が表示されます。
このファイルを更新すれば、TOPとギャラリーページの両方に反映されます。上から順に表示されます。

写真：
`{ "type": "photo", "category": "Off Shot", "title": "タイトル", "src": "images/gallery/ファイル名.webp" }`

写真を複数枚まとめる（アルバム）：
`{ "type": "photo", "category": "Live", "title": "タイトル", "src": "一覧に出す1枚", "images": ["1枚目", "2枚目", "3枚目"] }`

動画（YouTube）：
`{ "type": "movie", "category": "Music Video", "title": "タイトル", "youtube": "動画ID", "thumb": "" }`

動画（サイト内のファイル）：
`{ "type": "movie", "category": "Music Video", "title": "タイトル", "video": "movie/ファイル名.mp4", "thumb": "images/gallery/サムネイル.jpg" }`

- 動画IDは YouTube の URL `https://www.youtube.com/watch?v=XXXXXXXXXXX` の `XXXXXXXXXXX` 部分
- YouTube の場合、thumb を空にするとサムネイルが自動で使われます
- youtube と video の両方がある場合は youtube が優先されます（モーダル内に「Watch on YouTube」リンクも出ます）
- category は一覧の小さなラベルです（自由に書けます）

## トップの動画

`movie/kv.mp4` がトップのモニター内でループ再生されます（音なし）。差し替える場合は同じ名前で置き換え、`images/kv-poster.jpg`（読み込み前に出る静止画）も合わせて差し替えてください。
- 上から順に表示されます

## 確認するとき

JSON はブラウザで直接ファイルを開く（file://）と読み込めません。
VS Code の Live Server などローカルサーバー経由、またはサーバーにアップして確認してください。
