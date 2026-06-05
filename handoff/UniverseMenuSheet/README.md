# {Name} — design vs flutter ハンドオフ＆比較

このフォルダ = 1コンポーネント自己完結。Claude Design 由来の design とハンドオフ、
再現度を目視確認する比較ハーネスをまとめて置く。依存は Google Chrome のみ。

## 構成（このフォルダ内）

- `clean.html` — Claude Design specimen の完成形(After)を実機相当で切り出したデザイン描画
- `HANDOFF.md` — コード→Claude Design の逆ハンドオフ文書
- `build.sh` / `capture.sh` / `index.html` / `main_preview.dart` / `pairs.json` — 比較ハーネス
- `shots/` — 中間 PNG（design/flutter の素・`.gitignore` 済み）

成果物の合成画像は **`lib-design/preview/{Name}.png`** に出力される（preview にはこれだけ残す）。

## 使い方

1. **Flutter 側を表示**して撮る:
   ```
   flutter run -t lib-design/handoff/{Name}/main_preview.dart -d <booted-sim>
   ./capture.sh
   ```
2. **合成画像を生成**:
   ```
   ./build.sh        # → ../../preview/{Name}.png
   ```
   Flutter スクショが無ければ右ペインは「撮影待ち」。
3. **ライブで見る**: `index.html` をブラウザで開く（左 iframe=デザイン / 右 img=Flutter）。

## 新コンポーネントを足すとき

`lib-design/handoff/{NewName}/` を作り、`clean.html`・`HANDOFF.md` と本ハーネス一式を置く
（このフォルダを雛形にコピー → `main_preview.dart` の表示対象と `pairs.json` を差し替え）。
