# HANDOFF — ChatRoom（メッセンジャー個別ルーム・ダーク）逆ハンドオフ（Claude Design 用）

Claude Design に**作らせる**ための逆ハンドオフ。ChatList（ダーク inbox）の行 tap から連続する
**ChatRoomView**（1 対 1 メッセンジャー）をデザインシステムへ取り込む。現状実装は**真っ白な Material 画面**
（青ベタバブル `#1E88FF`・Material AppBar・生 TextField）で世界観外。これを **ダーク面**へ寄せ、
下端入力は **comp-composer 族**（StoryComment / CircleTimeline と共有）に統一する。

**面色 = ダーク**（遷移元 ChatList の inbox と一貫。写真フルブリードは使わず `--surface-raised` のダークガラス）。
**原則: 実装が単一の正。** specimen は実装を写す鏡。現状実装の構造（バブル/ヘッダー名前 fade/composer）を出発点にし、
改善は taste.md の引き算で。**世界観は不変**（ダーク＋カラフル放射グラデ＋ガラス／Noto Sans JP・Inter／絵文字なし／効果は 1 コンポーネント 1〜2 個）。
唯一のアクセントは **colorful gradient**（自分バブル／送信ボタン active）。

## repo / branch / raw base

- repo: `univbrofd/toopdbq`、branch: **`design/ds-sync`**
- raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq/design/ds-sync/`
- DS 索引: `lib-design/DesignSystem/_ds_manifest.json`（cards / tokens / fonts の芋づる索引）
- 姉妹（既存・ダーク）: `lib-design/handoff/ChatList/preview/comp-chat-list.html` / `comp-chat-row.html`

---

## A. デザインシステム現状監査（何があり・何が無いか）

**ある:**
- ダーク役割トークン一式: `--bg(#08080b)` / `--surface-raised(#16131f)` / `--surface-input(#2b2b2b)` /
  `--text-1/2/3` / `--gradient-colorful`(=`--primary`/`--unread`) / `--border-hairline` / `--shadow-avatar` 等（`colors_and_type.css`）
- ChatList specimen（ダーク・登録済）: `comp-chat-list.html` / `comp-chat-row.html`。行 spec に
  「tap → ChatRoomView（room入力=comp-composer族）」と**次画面への接続が明記済み**
- avatar: `preview/comp-avatar.html`（正円・`--shadow-avatar`・placeholder=`--gray-800`+icon_person）
- 入力: `preview/comp-textfield.html`（ただし地 `#7F7F7F` は AA 不合格・別 HANDOFF で `#2B2B2B` 是正中）

**足りていない / 乖離（=今回の対象）:**
1. **ChatRoom（メッセンジャールーム画面）の specimen が DS に無い。** ChatList の到達先なのに、room 側が空白。
2. **チャットバブルが DS 語彙に無い。** 会話の 2 者バブル（自分=右・相手=左＋アバター）は ChatList の feed 行とは別パーツ。
   comment 行（単列）とも別。**新規パーツ**として起こす必要がある。
3. **comp-composer に「最小 variant」が無い。** StoryComment / CircleTimeline の composer は
   返信先チップ＋自分アバター 34＋丸入力欄＋送信。ChatRoom は**チップもアバターも無い「丸入力欄＋送信」だけ**の最小形。
4. **現状実装は世界観外（直すべき逸脱）。** 白 Scaffold＋Material AppBar、バブル `#1E88FF`（chat-row note が明確に否定した Material blue）、
   生 TextField＋`Icons.send_rounded`。色トークン・ガラス・グラデ送信が未適用。

---

## B. 作ってほしいもの（成果物）

すべて DS 語彙（既存ダークトークン）で。新規発明はせず、各 specimen 先頭に
`<!-- @dsCard group="Components" name="..." subtitle="..." -->` を付け `_ds_manifest.json` の `cards` に登録。

### B-1. `comp-chat-room.html` — ChatRoomView（**ダーク**・新規・最優先）
画面ものなので **card.css の `.phone` 枠（393×852, SafeArea）** の中に実配置で描く。1 枚に状態を並べる:
- `default`（会話あり: 相手バブル＋自分バブルが交互）
- `empty`（「まだメッセージはありません」を中央・`--text-3`）
- `入力中(KB)`（キーボード上がり・composer が KB 直上に固定）
- header の **名前 fade**（操作後 6.4s で名前が opacity 0→戻りは戻るボタンのみ。実装の `nameVisible` 挙動）

anatomy:
- **header**: 左=戻る（`WdIconButton` + `assets/icons/icon_back.png`、最小 44pt）＋ 名前（`--text-1` / 14 / w600 / 省略）。
  **ヘッダーにアバターは出さない**（実装通り）。`titleSpacing 16`。下端に 1px ヘアライン（`--border-hairline`）。
- **message list**: 下が最新・上が最古（`reverse`）。上端ページング時は 18px スピナーを上端に。
- **composer**: 下端固定。B-3 の最小 composer（丸入力欄＋送信）。

### B-2. `comp-chat-bubble.html` — チャットバブル（**新規パーツ**・ダーク）
anatomy を 1 枚で:
- **自分 (me)**: 右寄せ・**`--gradient-colorful` 地**＋`--on-primary` テキスト＋subtle glow（効果 1 個）。アバター無し。
- **相手 (peer)**: 左寄せ・**`--surface-raised` のダークガラス**地＋`--text-1` テキスト。左に **アバター 36**（`--gray-800` placeholder + icon_person、tap→Profile）。
- 角丸: `--radius-lg(16)`、送信者側の下角だけ tail（4px）。max-width **72%**。縦 gap 3 / 横 margin 10。
- **実装が正の制約（捏造しない）**: バブルに**時刻・既読マーカー・日付セパレータは無い**（現状実装はテキストのみ）。装飾を足さない。
- text のみ（画像バブル無し。コメント sheet と同じく ChatRoom もテキスト専用）。

### B-3. `comp-composer.html` — 最小 variant 追加（**族の背骨**）
既存 comp-composer（dark/light の返信チップ＋アバター付き）に、**ChatRoom 用の最小 variant** を**ダーク面で**追加:
- 構成: **丸入力欄（`--surface-input` #2b2b2b・`--radius-pill`・hint=`--text-3`）＋送信 42** のみ。返信先チップ無し・自分アバター無し。
- 送信: active＝`--gradient-colorful`＋glow、inactive＝面なグレー（`--surface-toggle-off` 等）。
- 「StoryComment / CircleTimeline の composer と**同一ジオメトリ・同一アクセント**、チップ/アバターを外しただけ」を示す（族の最小末端）。

---

## C. 相互関係（chat / sheet family マップ）

```
ChatList(inbox, dark) ──row tap──▶ ChatRoom(messenger, dark)   ← 今回
   comp-chat-list / comp-chat-row        comp-chat-room
                                          └ feed: comp-chat-bubble（me=grad / peer=glass+avatar36）← 新規
                                          └ 下端: comp-composer【最小 variant】(field+send only)

comp-composer 族（共有の背骨・送信=gradient で統一）:
  StoryCommentSheet  : chip + avatar34 + field + send   (light)
  CircleTimelineSheet: chip + avatar34 + field + send   (dark)
  ChatRoom           :              field + send         (dark) ← 最小末端（今回追加）
```
- ChatRoom は ChatList の**到達先**。feed は単列コメント行ではなく**2 者バブル**（me/peer）= 新規パーツ。
- composer は族で共有。ChatRoom はその**最小形**。specimen 同士は subtitle で相互言及
  （chat-room→「from=ChatList行 / 入力=comp-composer最小」、chat-bubble→「used in=ChatRoom」）。

---

## D. 実装（正）と直すべき逸脱

| 対象 | 実装ファイル | 現状（世界観外） | 直し（ダーク DS 化） |
|---|---|---|---|
| 画面 | `lib/feature/Chat/ChatRoomView.dart` | 白 Scaffold＋Material AppBar(白/黒87/elev0.5) | `--bg`/`--surface-raised` ダーク・header=戻る(WdIconButton)＋名前 fade |
| 自分バブル | `widgets/ChatBubble.dart`（`bg=#1E88FF`） | Material blue（chat-row note が否定済） | `--gradient-colorful`＋`--on-primary`＋glow |
| 相手バブル | 〃（`bg=#EFEFF2`/black87・avatar36） | 明るいグレー・黒文字 | `--surface-raised` ガラス＋`--text-1`・avatar36(`--gray-800` ph) |
| 入力 | `widgets/ChatInputBar.dart`（生 TextField `#F2F2F4`＋`Icons.send_rounded #1E88FF`） | 二重実装・Material アイコン・青 | comp-composer 最小 variant（`--surface-input`＋送信 gradient/glow）へ統一 |
| empty | `ChatRoomView`（`Colors.black38`） | 場当たりグレー | `--text-3` |
| 名前 fade | `ChatRoomController.nameVisible`(6.4s) | 仕様（正・維持） | specimen に「操作後 6.4s で名前 fade」を反映 |

---

## E. 参照ファイル（全て raw base からの相対パス）

デザイン基盤:
- `lib-design/DesignSystem/_ds_manifest.json` / `colors_and_type.css` / `USAGE_RULES.md` / `taste.md`
- `lib-design/DesignSystem/preview/components.css` / `comp-avatar.html` / `comp-textfield.html` / `comp-icon-buttons.html`

姉妹（ダーク・正・遷移元）:
- `lib-design/handoff/ChatList/preview/comp-chat-list.html` / `comp-chat-row.html` / `card.css` / `components.css`
- icons: `lib-design/handoff/ChatList/assets/icons/`（`icon_back.png` / `icon_person.png` 等）

composer 族（共有の文法）:
- `lib-design/handoff/StoryCommentSheet/comp-story-comment.html` / `HANDOFF.md`
- `lib-design/handoff/CircleFooterTimeline/comp-circle-timeline.html`

実装（正）:
- `lib/feature/Chat/ChatRoomView.dart` / `ChatRoomController.dart` / `CLAUDE.md` / `SPEC.md`
- `lib/feature/Chat/widgets/ChatBubble.dart` / `ChatInputBar.dart`

---

## F. Claude Design に貼るプロンプト

```
design/ds-sync の Toopdbq DS を正として、ChatRoom（1対1メッセンジャールーム・ダーク）を DS に取り込む。
ChatList(ダーク inbox)の行 tap から連続する到達先。下端入力は comp-composer 族に統一する。
索引: https://raw.githubusercontent.com/univbrofd/toopdbq/design/ds-sync/lib-design/DesignSystem/_ds_manifest.json
HANDOFF: https://raw.githubusercontent.com/univbrofd/toopdbq/design/ds-sync/lib-design/handoff/ChatRoom/HANDOFF.md

土台は USAGE_RULES.md → taste.md → colors_and_type.css。新規発明せず既存トークン/Wd* を使う。
世界観厳守（ダーク＋カラフル放射グラデ＋ガラス／Noto Sans JP・Inter／絵文字なし／効果1〜2個）。
面=ダーク。写真フルブリードは使わず --surface-raised のダークガラス。唯一のアクセント=colorful gradient。

作るもの:
1. comp-chat-room.html（ChatRoomView・ダーク）: card.css の .phone 枠(393×852/SafeArea)に実配置。
   状態 default/empty/入力中(KB)/名前fade(操作後6.4sで header 名前 opacity 0)。
   header=戻る(WdIconButton+icon_back, 44pt)＋名前(--text-1/14/w600/省略)、ヘッダーにアバター無し、下端ヘアライン。
   message list は下=最新/上=最古、上端ページングに 18px スピナー。
2. comp-chat-bubble.html（新規パーツ・ダーク）: 自分=右/--gradient-colorful+--on-primary+glow/アバター無し。
   相手=左/--surface-raised ガラス+--text-1/左にアバター36(--gray-800 ph+icon_person, tap→Profile)。
   角丸16+送信側下角tail4、max-width72%。時刻/既読/日付セパレータは描かない(実装はテキストのみ・捏造禁止)。
3. comp-composer.html に ChatRoom 用「最小 variant」をダーク面で追加: 丸入力欄(--surface-input/pill/hint=--text-3)＋送信42 のみ。
   返信先チップ無し・自分アバター無し。送信 active=--gradient-colorful+glow / inactive=グレー。
   StoryComment/CircleTimeline composer と同一ジオメトリ・同一アクセントで、チップ/アバターを外しただけと示す。

旧実装の青バブル #1E88FF(Material blue) は世界観外で不可。バブルは族の bubble、入力は composer 最小末端。
各 specimen 先頭に @dsCard を付け _ds_manifest.json に登録。最終はダウンロード可能な bundle で出力。
```

---

## G. 取り込み（Claude Design が出した後）

bundle URL を `/design {URL}` で取得・展開 → `references/handoff.md` C の reconcile（Claude 側の新規カード
`comp-chat-room` / `comp-chat-bubble` / 更新 `comp-composer` を `DesignSystem/preview/` へ、`_ds_manifest.json` を
superset マージ）→ `design/ds-sync` へ push。以後コードは **実装が正**として specimen を保守
（`ChatRoomView` / `ChatBubble` / `ChatInputBar` をダーク DS 値へ寄せ、青ベタ/Material アイコンを撤去）。
