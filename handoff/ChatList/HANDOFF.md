# HANDOFF — ChatList（チャット一覧 inbox・ダーク）逆ハンドオフ（Claude Design 用）

ChatList は実装・specimen とも**既にダーク DS 準拠**（specimen は DS 登録済み: `comp-chat-list` / `comp-chat-row`）。
この HANDOFF は他 View と同じ自己完結の入口を整え、**実装の実値を design 上の正として固定**し、
画面 specimen を **canonical デバイス枠（card.css の `.phone` = iPhone 17）へ刷新**してもらうためのもの。

**原則: 実装が単一の正。** specimen は実装を写す鏡。装飾の捏造禁止（時刻形式・状態・コピーは下の実値どおり）。
**世界観は不変**（ダーク＋カラフル放射グラデ＋ガラス／Noto Sans JP・Inter／絵文字なし／効果は 1 コンポーネント 1〜2 個）。
唯一のアクセントは **`--unread`（= `--gradient-colorful` = `--primary`）の未読バッジ**。Material blue 不可。

## repo / branch / raw base

- repo: `univbrofd/toopdbq-design`、branch: **`main`**（public・raw リンクで直接取得可）
- raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
- DS 索引（**唯一の索引**）: `DesignSystem/_ds_manifest.json`（cards / globalCssPaths / tokens / fonts）
- 登録済みカード: `DesignSystem/preview/comp-chat-list.html`（ChatListView inbox）/ `comp-chat-row.html`（行 anatomy）
- 到達先（姉妹）: `handoff/ChatRoom/`（messenger・comp-chat-room / comp-chat-bubble / comp-composer 最小）

---

## A. 現状監査

**ある（正しく登録済み）:**
- ダーク役割トークン一式（`DesignSystem/colors_and_type.css` が canonical）
- `comp-chat-list.html`: default / empty の 2 状態。`comp-chat-row.html`: 行 anatomy ＋ 未読/既読/ミュート

**直したい（今回の対象）:**
1. **画面 specimen のデバイス枠が自作 441×760 `.frame`**。canonical 昇格（card.css `.phone` = iPhone 17・402×874・
   Dynamic Island・statusbar 62 / home-ind 34）より前の作りで、他の画面 specimen と枠が揃っていない。
2. status bar が自作 CSS（dots/battery 手描き）。card.css の `.statusbar` / `.dynamic-island` / `.home-ind` chrome に統一したい。

---

## B. 作ってほしいもの（成果物）

新規発明はせず既存トークンで。specimen 先頭の `<!-- @dsCard ... -->` と `_ds_manifest.json` 登録は維持（パスも維持）。

### B-1. `comp-chat-list.html` 刷新（最優先）
**card.css の `.phone` 枠（iPhone 17・full-bleed・SafeArea chrome 使用）**に実配置で再描画。状態はそのまま 2 つ:
- `default`（行リスト: 未読 / 既読 / ミュートが混在する現実的な並び）
- `empty`（中央の空状態。下の D の実値どおり）

### B-2. `comp-chat-row.html` 確認・微調整
カタログ形式のままでよい。状態（未読/既読/ミュート）の色・太さ・バッジ抑制が D の実値と一致しているか照合し、
ズレだけ直す。行 tap → ChatRoomView（最小 44pt 行高は padding 12×2＋内容で満たす）の注記は維持。

---

## C. 関係マップ

```
ChatListView(inbox, dark) ──row tap──▶ ChatRoomView(messenger, dark)
  comp-chat-list / comp-chat-row          comp-chat-room（bubble=me grad/peer glass・composer 最小）
```

---

## D. 実装の実値（design 上の正・捏造禁止）

実装は別 repo `univbrofd/toopdbq` の `lib/feature/Chat/ChatListView.dart`（参考・素テキスト。この表の値が正）。

| 部位 | 実値 |
|---|---|
| 面 | `--bg`(#08080b)。写真フルブリードなし |
| header | SafeArea 上 + 高さ 56。上スクリム `linear-gradient(180deg, rgba(0,0,0,.5), transparent)`。中央タイトル「チャット」Noto Sans JP w600 19 `--text-1`＋text-shadow 0 1px 2px rgba(0,0,0,.5)。左=戻る WdIconButton(simple・44pt・左 8) |
| 行 | padding 16(h)×12(v)。avatar 48 正円＋`--shadow-avatar`、placeholder=`--gray-800`＋icon_person 25(`--text-3`)。avatar→テキスト gap 12 |
| 1行目 | 名前 Noto Sans JP w700 16/1.2（省略）＋（mute時 mic 14・opacity .42）＋ 時刻 Inter w500 12 |
| 2行目 | 1行目との gap 3。本文 Noto Sans JP 14/1.3（省略）＋ 未読バッジ |
| 状態: 未読 | 本文 `--text-1` w500・時刻 `--text-2`・バッジ表示 |
| 状態: 既読 | 本文 `--text-2` w400・時刻 `--text-3`・バッジ無し |
| 状態: ミュート | 名前 `--text-2`・本文 `--text-3`・avatar opacity .82・mic 表示・**未読でもバッジ抑制** |
| バッジ | h20・minW20・padX6・pill・地=`--unread`(colorful gradient)・数字 Inter w700 11 `--on-primary`・上限 99+ |
| 区切り | 1px・左 inset 76 / 右 16。横グラデ rgba(255,255,255,.04)→.16→.04（中央が `--border-hairline`） |
| 時刻形式 | 当日=HH:mm、それ以外=M/D（例: 6/5） |
| empty | 正円 64（地 rgba(255,255,255,.05)・枠 1px rgba(255,255,255,.16)）＋comment icon 28 rgba(255,255,255,.5)→gap16→「まだメッセージはありません」w700 15 `--text-2`→gap6→「サークルで出会った人とのチャットが、ここに表示されます。」13/1.5 `--text-3`（幅 220 中央） |
| loading | 中央スピナー 2px `--text-3`。pull-to-refresh は地 `--surface-raised`(#16131f)＋白 |
| tap | 行 tap→ChatRoomView。highlight rgba(255,255,255,.05) |

---

## E. 参照ファイル（全て raw base からの相対パス）

- `DesignSystem/_ds_manifest.json` / `colors_and_type.css` / `USAGE_RULES.md` / `taste.md`
- `DesignSystem/preview/card.css`（`.phone` 枠の正）/ `components.css` / `comp-chat-list.html` / `comp-chat-row.html`
- icons: `assets/icons/`（`icon_back.png` / `icon_person.png` / `icon_mic.png` / `icon_comment.png`）
- 姉妹: `handoff/ChatRoom/HANDOFF.md`（到達先 messenger）

---

## F. Claude Design に貼るプロンプト

```
toopdbq-design(main) の Toopdbq DS を正として、ChatList（チャット一覧 inbox・ダーク）の specimen を刷新する。
索引: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/DesignSystem/_ds_manifest.json
HANDOFF: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/ChatList/HANDOFF.md

土台は USAGE_RULES.md → taste.md → colors_and_type.css。新規発明せず既存トークンを使う。
世界観厳守（ダーク＋カラフル放射グラデ＋ガラス／Noto Sans JP・Inter／絵文字なし／効果1〜2個）。
唯一のアクセント=未読バッジの --unread(colorful gradient)。Material blue 不可。

作るもの:
1. comp-chat-list.html を card.css の .phone 枠（iPhone 17・full-bleed・.statusbar/.dynamic-island/.home-ind）
   へ刷新。自作 441×760 フレームと手描き status bar を撤去。状態は default / empty の 2 つ。
2. comp-chat-row.html は HANDOFF の D 表（実装の実値）と照合し、ズレだけ修正。
   未読/既読/ミュートの色・太さ・「ミュート時はバッジ抑制」を厳守。
装飾の捏造禁止（時刻=当日HH:mm/それ以外M/D、バッジ99+上限、行の値は D 表どおり）。
@dsCard と _ds_manifest.json の既存登録（パス）は維持。最終はダウンロード可能な bundle で出力。
```
