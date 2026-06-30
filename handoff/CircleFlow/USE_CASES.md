# USE_CASES — CircleFlow

サークル作成・選択フローの UC（操作ユースケース）。design specimen と Flutter 実機を**この同名 UC ごと**に
撮って横並び比較する（`shots/{uc}.png` = 現状実機 before）。状態 × 操作 × 期待で定義。

| UC | 画面 | 状態・操作 | 期待（見た目・挙動） |
|---|---|---|---|
| `select-grid` | CircleSelect | 近傍サークルあり | 2 列グリッドにサークルカード。右下に追加ボタン |
| `select-empty` | CircleSelect | 位置情報なし / 近傍ゼロ | 一覧が空。**案内 + 「作る」CTA を出す**（現状は黒画面のみ＝要改善） |
| `select-confirm` | CircleSelectConfirm | カードを tap | 選択候補を確認 → 確定で投稿フローへ返す（**手数を軽く**＝要改善） |
| `edit-camera` | CircleEdit | 新規作成の起点（写真未設定） | 地図 + 写真選択 + 名前/説明入力。footer が画面を覆い過ぎない（現状 466px＝要改善） |
| `edit-editing` | CircleEdit | 写真 + 名前 入力済み | アバター + 名前 + 説明 + 「作成」。次は場所選択へ誘導 |
| `edit-maptap` | CircleEdit | 地図 tap で中心選択 | 中心ピン + 範囲円。既定半径。距離スライダー表示 |
| `edit-range` | CircleEdit | スライダーで範囲拡大 | 円が広がり地図 zoom 追従。距離ラベル更新（例 1.7km） |
| `edit-save-ready` | CircleEdit | 名前 + 場所 + 範囲 が揃う | 「作成」が有効＝押せる状態と分かる（現状は無効でも同じ見た目＝要改善） |

## 比較の前提

- design = `card.css` `.phone`（iPhone 17 402×874）にフルスクリーン配置。Flutter = mock 実機（`--dart-define=MOCK_DATA=1`、現在地 渋谷ハチ公）。
- 同一データ（mock circles）で内容を揃える。代表サークルは「サークル渋谷」。
