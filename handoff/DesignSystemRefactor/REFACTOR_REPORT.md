# DesignSystemRefactor — 是正レポート（責務分離 / 2層化 + screen 分離）

date: 2026-06-15 · scope: `preview/` 全 specimen ＋ `_ds_manifest` 索引 ＋ `ui_kits/`

狙い: design system が画面まで抱えて肥大していた状態を解き、**canonical なシステムを Foundation＋再利用 Component のみ**に収斂。画面（フル画面・シート・フロー・UIキット）は「システムを**消費する**合成物」であり DS の責務外 → **本プロジェクトから分離・除去**した。

---

## 1. 最終構成（システム索引）

| tier | 中身 | 枚数 | 索引 |
|---|---|---|---|
| **foundation** | Colors(6) / Type(3) / Spacing(3) / Brand(3) | 15 | ✅ システム索引 |
| **component** | Wd* atoms＋複数画面で再利用される molecule（`comp-01`〜`comp-14`） | 14 | ✅ システム索引 |
| **exploration** | 探求の記録 | 1 | ✖ 索引外 |
| ~~screen~~ | ~~フル画面・シート・フロー・UIキット~~ | **0（全削除）** | — 分離 |

**canonical system = foundation(15) + component(14) = 29 枚**。screen-tier は 0 になり、DS は lean な部品ライブラリに純化した。
- 機械可読の成果物: [`_ds_manifest.tiered.json`](./_ds_manifest.tiered.json)（`systemIndex` に lean 集合、`separatedOut` に分離した画面の一覧）。

---

## 2. 分離・除去した画面（DS の責務外 = consumer 側）

| specimen | 種別 | 判定 |
|---|---|---|
| `universe-screen` | フル画面（サークル別プレイリスト） | 合成物 → 消費側 |
| `universe-focus` | フル画面（3D フォーカス） | 合成物 → 消費側 |
| `universe-3d-overlay` | フル画面（3D ビューア） | 合成物 → 消費側 |
| `universe-flow` | フロー（タップ動線） | 合成物 → 消費側 |
| `terrestrial-stage` | ビュー（ステージビーコン） | 合成物 → 消費側 |
| `chat-list` / `chat-row` | 画面 + 画面専用 row | 合成物 → 消費側 |
| `menu-sheet` / `story-comment-sheet` | bottomSheet | 合成物 → 消費側 |
| `screen-01`〜`screen-08` | splash/onboarding/login/universe/story×3/timeline | 合成物 → 消費側 |
| `ui_kits/app/*` | フル画面 JSX キット（10 files） | 合成物 → 消費側 |

> いずれも「単一画面・シート・ビュー・フローの合成物」= **screen**。判定ルール（Wd* で複数画面が使う = component / 合成物 = screen）に従い DS から除去。`comp-01`〜`comp-14`（true Wd*）と foundation は **canonical のため無改変で保持**。
> 付随して未参照になった `preview/screen.css`（screen specimen 専用 scaffold）も削除。

---

## 3. リファクタ前に是正した consumer 違反（記録）

削除前の段階で screen 内に確認・是正した違反（履歴として保存）:

- **`universe-screen`**: ① ad-hoc グレー直書き `#2b2b2b` → `--surface-input` ② WdIconButton 再実装の世界観外グレーガラス `rgba(120,120,120,.5)+blur(3px)` → 役割トークン `--lg-tint-dark`＋liquid-glass レシピ ③ 手描き SVG アバター → `assets/icons/icon_person.png`。
- **`universe-flow`**: `.m-badge .av { background:#2b2b2b }` → `--surface-input`。
- **`menu-sheet` / `story-comment-sheet`**: シート面・composer の liquid-glass レシピをインライン再発明（canonical `.wd-sheet`/`.wd-composer`/`.lg-btn` 不使用）。
- **`terrestrial-stage` / `universe-3d-overlay`**: 3D を手描き SVG（`#gem`）で描画（モノクロ・ホログラム anim 状態のデモで意図的だが、汎用には `assets/images/uv/obj-NN` が正）。

> これらは画面ごと DS から除去されたため、是正は consumer 側プロジェクトの責務に移行。**今後の再発防止＝下記 consumer 規律。**

監査で検出**されなかった**もの（既にクリーン）: screen 内の `:root` トークン再定義 / Material Icons フォント直書き / `#7F7F7F` 系コントラスト違反グレー。

---

## 4. consumer 規律（DS を消費する側＝画面プロジェクトが守る事項）

1. 色 / type / spacing / radius / shadow を画面内で**再定義しない** → `colors_and_type.css` の役割トークンを参照。
2. button / avatar / row / header / sheet / composer を**再実装しない** → `components.css`（`.wd-*` / `.lg*` / `.chat-*`）を再利用。
3. **1 画面でしか使わない部品は component に昇格させない**（その画面内に留める）。
4. ハードコードのグレー・Material アイコン・場当たり値は**役割トークン / 白 PNG**へ寄せる。
5. 3D オブジェクトは `assets/images/uv/obj-NN`（透過 PNG）を参照（手描き SVG を作らない）。

DS 本体は foundation＋component のみ。画面はこの規律に従い、別プロジェクト（consumer）で合成する。
