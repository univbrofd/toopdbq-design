# App Baseline — Flutter 実装を正とした起点

Claude Design で機能を考えるときの**唯一の起点**。ここに載っている状態が「アプリの今」であり、
一次情報は Flutter 実装（repo `univbrofd/toopdbq` の master）。specimen や過去 handoff と
食い違ったら**このファイルと shots が勝つ**。

- 起点 page（Claude Design に同期する閲覧用）: `Baseline.html`
- 再基準化: アプリ repo の `/design-baseline` スキル（実装から shots・インベントリ・page を再生成して push / 同期）
- shots はアプリ repo `lib-test/` の各スイート実機撮影（iPhone 17 sim・mock データ）を 1206px JPEG に落としたもの

## 再基準化ログ

| 日付 | 実装コミット | 範囲 |
|---|---|---|
| 2026-08-22 | 05e361a7 | 初回作成: onboarding / quest home / quest timeline / story viewer |

## 画面インベントリ

凡例: ✅ = 現行 shots + specimen 揃い / 🟡 = specimen 現行・shots 未撮影（または逆）/ 🟠 = 要照合（乖離の疑い）/ ⬜ = 未基準化 / 🗄 = 歴史資産（現行アプリに存在しない）

### 起動・オンボーディング

| 画面 | 実装 | canonical specimen | shots | 状態 |
|---|---|---|---|---|
| Splash | `lib/feature/Splash/` | `handoff/SplashView/comp-splash-view.html` | — | 🟡 shots 未撮影 |
| Onboarding（ライト5面・実地図+blur焼き込み） | `lib/feature/Onboarding/` | `handoff/Onboarding/Onboarding.html` | `onb-OB01..OB05`（2026-08-20） | ✅ |
| Auth（ログイン） | `lib/feature/Auth/` | なし | — | ⬜ |

### Home = クエスト（アプリの主画面）

実装はすべて `lib/feature/Universe/`（旧「circle home」は 2026-07-31 のクエスト刷新で全面置換済み）。

| 画面 | 実装 | canonical specimen | shots | 状態 |
|---|---|---|---|---|
| おすすめ（起動一発目 = 前日クエスト結果の 2 列 masonry） | `Universe/`（QuestRecommendSheet） | `handoff/UniverseQuestRecommend/UniverseQuestRecommend.html` | — | 🟡 shots 未撮影 |
| クエスト home（マップパネル＋看板＋投稿カメラ＋フィード） | `Universe/`（QuestFeedSheet / QuestBoard） | `handoff/UniverseQuest/UniverseQuest.html`（`?screen`） | `quest-Q00-boot`, `quest-Q02-collapsed` | ✅ 2026-08-21 |
| クエスト feed 拡大（既定・マップは縮小トグル） | 同上（`questFeedExpanded`） | 同上 | `quest-Q01-expanded` | ✅ |
| 過去日お題（member 閲覧・日単位ロック） | 同上（`canViewDay`） | 同上 | `quest-Q03-member`, `quest-Q03-past` | ✅ |
| 未達成ロック＋エリア外（blur・カメラ非活性「エリアまで N km」） | 同上 | `handoff/UniverseQuestNoArea/UniverseQuestNoArea.html` | `quest-Q04-locked` | ✅ |
| クエスト → タイムライン（ピルで開く） | `Universe/` + `lib/feature/CircleStoryList/` | `handoff/CircleFooterTimeline/comp-circle-timeline.html` | `questtl-Q00-list`, `questtl-Q01-open` | 🟠 specimen 要照合 |

### StoryViewer（投稿閲覧）

| 画面 | 実装 | canonical specimen | shots | 状態 |
|---|---|---|---|---|
| StoryViewer（縦送り・横動画は回転フィット） | `lib/feature/StoryViewer/` | `handoff/StoryOverlay/comp-story-overlay.html`（オーバーレイ刷新は worktree 進行中） | `story-F00-portrait`, `story-F01-landscape`（2026-08-21） | ✅（overlay は 🟠） |

### 投稿フロー

| 画面 | 実装 | canonical specimen | shots | 状態 |
|---|---|---|---|---|
| 投稿（看板タップ → 撮影 → 編集 → 提出 → 解錠） | `lib/feature/UniversePostFlow/` `StoryPost/` `StoryVideoEdit/` `PostPin/` | `handoff/UniversePostFlow/UniversePostFlow.html` | — | 🟠 specimen はクエスト刷新前・要照合 |

### 未基準化（次回 /design-baseline の候補）

| 画面 | 実装 | 既存 specimen | 状態 |
|---|---|---|---|
| Chat（一覧 / ルーム） | `lib/feature/Chat/` | `handoff/ChatList/index.html`, `handoff/ChatRoom/index.html` | 🟡 実機未照合 |
| Profile | `lib/feature/Profile/` | なし | ⬜ |
| サークル作成（マップ上インプレイス） | `lib/feature/CircleCreate/` `CircleFounding/` | なし | ⬜ |
| 下書き一覧 | `lib/feature/DraftList/` | なし | ⬜ |

### 歴史資産（現行アプリに存在しない — 起点にしない）

| specimen | 何だったか |
|---|---|
| `handoff/UniverseCircle/UniverseCircle.html` | 旧 circle home（回転デッキ＋シート）。2026-07-31 撤去。部品の一部は投稿フローに残存 |
| `handoff/UniverseView/UniverseView.html` | 旧地図 home（3D ピン + リール） |
| `handoff/UniverseCircleGrid/` `handoff/UniverseCircleReel/` | 旧 home 派生の実験 |

## 運用ルール

- **Flutter 実装が正**。specimen を直したら design-to-flutter で実装に入れ、実装が確定したら `/design-baseline` でここを更新する（逆流禁止）
- 新機能の発想は Claude Design 上で `Baseline.html` を見て現状を掴み、対象画面の canonical specimen（表の該当行）を Remix して始める
- shots は再生成物。手で差し替えない（`/design-baseline` が lib-test スイートの実機撮影から作る）
