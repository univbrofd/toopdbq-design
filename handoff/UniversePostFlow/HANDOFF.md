# UniversePostFlow — 地球から投稿フロー

Claude Design project「StoryPost の位置決めフロー」(`Earth Globe.dc.html`) の取り込み。
UniverseView の globe から投稿ボタンで現在地へ降下 → サークル選択 → 撮影 → 編集 → 投稿までの一連フロー specimen。

- specimen: `UniversePostFlow.html`（studio 表示）/ `UniversePostFlow.html?screen`（端末画面のみフルスクリーン）
- map engine: `earth/*.js`（MapLibre globe・positron）。foundation/assets は canonical 参照（`../../DesignSystem`, `../../assets`）。
- camera 動画は `../../assets/sample/3d/mqmbpk42_d6sz/{video.mp4,thumbnail.jpg}` を流用（元 `media/` はサンプルプールへ差し替え）。

## フロー（5 段階）

1. **globe (idle)**: 地球儀（zoom 2.6 / pitch 0 / bearing 0）。サークルピン・現在地ドットは非表示。右下に投稿ボタン（`.post-fab`）＋ヒント「いまここから投稿」。
2. **投稿ボタン tap → `enterCircles()`**: globe 再設定を止め、FAB を隠し、`flyTo(zoom 16, pitch 0, bearing 0, 2300ms)` で渋谷へ降下。1150ms 後に `EarthGroups.setVisible(true)`（サークルピン＋エリア出現）・現在地ドット表示・`ccPanel`（入っているサークル一覧）表示。
   - = 投稿モードでは **角度 0・既存ストーリーピンを消し・周辺サークルだけを mapping**。
3. **サークル選択 → `ccPanel` の「ストーリーを投稿」(`openCam`)**: フルスクリーンカメラ（`.cam-screen`）を開く。
4. **camera**: stage `idle → recording → edit → thumb`。
   - capture: 画像/動画モード切替、シャッター（赤丸＝録画 / 四角＝停止）、左にアルバム、右にカメラ切替、×閉じる、REC タイマー。
   - **edit（動画トリム）**: プレビュー＋トリムバー（左右ハンドルをドラッグ）。`MAX = 60`（1 分）。選択尺が 60s 以上だと「アップロード」が disabled（「1分未満に切り取ってください」）。`?` 上限ラベル「上限 1:00」。
   - thumb: 表紙フレーム選択 → 「投稿する」。
5. **post-confirm sheet**: 位置情報 toggle / 3D生成 toggle（位置情報 on のときのみ）→ 「投稿する」で globe に戻り、上部に投稿プログレス。

## Flutter 実装メモ（このプロジェクトの依頼スコープ）

- 1 画面目は現行 Flutter UniverseView のまま。投稿ボタンで 2.（角度 0・ストーリーピン消去・周辺サークル mapping）へ。
- サークル選択 → 投稿で既存 Flutter カメラへ統合。現行カメラは写真のみ／左にアルバムボタン → **動画/写真トグル**へ変更。
- 動画撮影後の**1 分以内トリム編集画面**を新規追加（design の edit stage が一次情報）。

実装は `design-to-flutter`（{View}=UniversePostFlow）へ引き継ぐ。
