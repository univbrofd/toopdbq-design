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
| 2026-08-22 (5) | 05e361a7 + 未コミット作業ツリー | 全域拡張: 投稿フロー 7 枚（stages driver の認証経路を authStateChanges 化に追随修正して撮影）・サークル作成 4 枚・Chat 2 枚（testChat 新設 + mock inbox に CHAT_MESSAGE 追加）・Profile/下書き 3 枚（testProfile 新設）・Auth 1 枚（testAuth 新設）。タイムライン specimen 照合（fraction スナップ 0.25/0.5/0.92・velocity 800・単一フィード・composer すべて実装一致 → ✅）。StoryOverlay worktree は master へマージ済みを確認 → ✅ |
| 2026-08-22 (4) | 05e361a7 + 未コミット作業ツリー | おすすめ起動画面の廃止を確認し 🗄 歴史資産へ（QuestRecommendSheet はどこからも未描画・起動はフィード直起動）。testSplash スイート新設で Splash を ✅ に |
| 2026-08-22 (3) | 05e361a7 + 未コミット作業ツリー | Q04-past 撮影成功。原因 = 新宿の circle-04 は渋谷と geohash セルが precision 4 で分かれ近傍 sweep に載らない → ドライバを関心経路（markInterest → reassert）へ修正して解決。quest 5 枚を最新ビルドで撮り直し |
| 2026-08-22 (2) | 05e361a7 + 未コミット作業ツリー | 全 4 スイート再撮影(8/22 昼の実装変更に追随)。旧 UC Q03-member / Q04-locked はドライバから撤去済みのため削除 |
| 2026-08-22 | 05e361a7 | 初回作成: onboarding / quest home / quest timeline / story viewer |

## 画面インベントリ

凡例: ✅ = 現行 shots + specimen 揃い / 🟡 = specimen 現行・shots 未撮影（または逆）/ 🟠 = 要照合（乖離の疑い）/ ⬜ = 未基準化 / 🗄 = 歴史資産（現行アプリに存在しない）

### 起動・オンボーディング

| 画面 | 実装 | canonical specimen | shots | 状態 |
|---|---|---|---|---|
| Splash（blur 背景＋白ロゴ呼吸アニメ） | `lib/feature/Splash/` | `handoff/SplashView/comp-splash-view.html` | `splash-SP00`（2026-08-22） | ✅ |
| Onboarding（ライト5面・実地図+blur焼き込み。①世界中のサークル俯瞰 ②クエストに挑戦 ③クエストの報酬=blur解錠 ④いいねが友情のきっかけ ⑤位置プリパーミッション） | `lib/feature/Onboarding/` | `handoff/Onboarding/Onboarding.html` | `onb-OB01..OB05`（2026-08-22） | ✅ |
| Auth（ログインオーバーレイ。home 上に Toopdbq カード + Google/Apple ボタン。認証必須アクション時に `requireAuth` が表示） | `lib/feature/Auth/` + `lib/component/ui/modal/Auth/` | なし | `auth-AU00-overlay`（2026-08-22） | 🟡 specimen 未作成 |

### Home = クエスト（アプリの主画面）

実装はすべて `lib/feature/Universe/`（旧「circle home」は 2026-07-31 のクエスト刷新で全面置換済み）。
起動は**クエストフィード直起動**（「エリア内 × 開催中のお題」で投稿数最多のサークルを先頭に据える。旧「おすすめ」起動画面は廃止 → 歴史資産）。

| 画面 | 実装 | canonical specimen | shots | 状態 |
|---|---|---|---|---|
| クエスト home（マップパネル: 域リング内サークル名・お題＋残り時間はマップ上部・カメラは右上・下はフィード） | `Universe/`（QuestFeedSheet / QuestBoard） | `handoff/UniverseQuest/UniverseQuest.html`（`?screen`） | `quest-Q00-boot`, `quest-Q02-collapsed` | ✅ 2026-08-22 |
| クエスト feed 拡大（既定・マップは縮小トグル。上部にタイマー＋お題見出し） | 同上（`questFeedExpanded`） | 同上 | `quest-Q01-expanded` | ✅ |
| 過去日お題＋エリア外＋ロック列（「エリアまで N km」ピル・右に blur ロックの日、日単位解錠 `canViewDay`） | 同上 | `handoff/UniverseQuestNoArea/UniverseQuestNoArea.html` | `quest-Q03-past` | ✅ |
| 未提出エリア外サークルの初期表示（初期中心 = 1 つ前の過去日。今日まで送ると blur + lock-note） | 同上 | 同上 | `quest-Q04-past` | ✅ |
| クエスト → タイムライン（ピルで開く） | `Universe/` + `lib/feature/CircleStoryList/` | `handoff/CircleFooterTimeline/comp-circle-timeline.html` | `questtl-Q00-list`, `questtl-Q01-open`（2026-08-22） | ✅ 照合済（fraction スナップ 0.25/0.5/0.92・velocity 800・単一フィード・下端 composer すべて実装一致） |

### StoryViewer（投稿閲覧）

| 画面 | 実装 | canonical specimen | shots | 状態 |
|---|---|---|---|---|
| StoryViewer（縦送り・横動画は回転フィット） | `lib/feature/StoryViewer/` | `handoff/StoryOverlay/comp-story-overlay.html` | `story-F00-portrait`, `story-F01-landscape`（2026-08-22） | ✅（オーバーレイ刷新 worktree は master マージ済み。shots は刷新後実装） |

### 投稿フロー

shots は `testPostFlow/shootStages.sh`（fake image_picker でカメラ回避・実 Controller 駆動の dense burst）から採取。

| 画面 | 実装 | canonical specimen | shots | 状態 |
|---|---|---|---|---|
| 撮影（お題ヘッダー + シャッター + 写真/動画切替 + AI トグル） | `StoryPost/` | `handoff/UniversePostFlow/UniversePostFlow.html` | `post-P00-camera`（2026-08-22） | 🟠 specimen はクエスト刷新前・要照合 |
| 画像編集（投稿する / 下書き保存 / サークル表示 / SNS カウント） | `StoryPost/` | 同上 | `post-P01-edit` | 🟠 同上 |
| テキスト compose（キーボード + 配置テキスト） | `StoryPost/`（StoryComposeOverlay） | 同上 | `post-P02-compose` | 🟠 同上 |
| 投稿完了（home 復帰 + 左上アップロード pill） | `Universe/` + `StoryUpload/` | 同上 | `post-P03-posted` | 🟠 同上 |
| 動画トリム（切り取り + 完了） | `StoryVideoEdit/` | 同上 | `post-P04-vid-trim` | 🟠 同上 |
| 動画サムネイル選択（表紙フレーム + 字幕トグル） | `StoryVideoEdit/` | 同上 | `post-P05-vid-thumb` | 🟠 同上 |
| 動画投稿確定（投稿の設定シート） | `StoryVideoEdit/` | 同上 | `post-P06-vid-confirm` | 🟠 同上 |

### Chat

| 画面 | 実装 | canonical specimen | shots | 状態 |
|---|---|---|---|---|
| チャット一覧（未読バッジ + N 件の新着。announcement 受信箱を drain して構築） | `lib/feature/Chat/` | `handoff/ChatList/index.html` | `chat-CH00-list`（2026-08-22） | ✅（実装は specimen 由来・トークン一致） |
| チャットルーム（日付チップ + 相手/自分バブル + 下端 composer） | `lib/feature/Chat/` | `handoff/ChatRoom/index.html` | `chat-CH01-room`（2026-08-22） | ✅ |

### Profile・サークル作成

| 画面 | 実装 | canonical specimen | shots | 状態 |
|---|---|---|---|---|
| プロフィール（自分: 右上メニュー。アバター + 名前 + 3 カウント + Posts 自由配置ボード） | `lib/feature/Profile/` | なし | `profile-PR00-self`（2026-08-22） | 🟡 specimen 未作成 |
| プロフィール（他人: relation アクション） | 同上 | なし | `profile-PR01-other` | 🟡 |
| 下書き一覧（3 列グリッド。shot のサムネは mock 都合の placeholder — 実機では実画像） | `lib/feature/DraftList/` | なし | `profile-PR02-drafts` | 🟡 |
| サークル作成（Earth 上インプレイス・中心レティクル・入口） | `lib/feature/CircleCreate/` | なし | `circle-create-open`（2026-08-22） | 🟡 specimen 未作成 |
| サークル作成（写真 + 名前 + 説明 入力済・作成有効） | 同上 | なし | `circle-create-filled` | 🟡 |
| サークル作成（範囲スライダー + リング追従） | 同上 | なし | `circle-create-range` | 🟡 |
| サークル作成（名前欄フォーカス・キーボード上にシート持ち上げ） | 同上 | なし | `circle-create-keyboard` | 🟡 |

### 未基準化（次回 /design-baseline の候補）

| 画面 | 実装 | 既存 specimen | 状態 |
|---|---|---|---|
| サークル設立フロー（CircleFounding） | `lib/feature/CircleFounding/` | なし | ⬜ |

### 歴史資産（現行アプリに存在しない — 起点にしない）

| specimen | 何だったか |
|---|---|
| `handoff/UniverseCircle/UniverseCircle.html` | 旧 circle home（回転デッキ＋シート）。2026-07-31 撤去。部品の一部は投稿フローに残存 |
| `handoff/UniverseView/UniverseView.html` | 旧地図 home（3D ピン + リール） |
| `handoff/UniverseCircleGrid/` `handoff/UniverseCircleReel/` | 旧 home 派生の実験 |
| `handoff/UniverseQuestRecommend/` | 旧おすすめ起動画面（前日クエスト結果の 2 列 masonry）。起動はフィード直起動に変更され廃止。`QuestRecommendSheet.dart` は widget 定義のみ残骸（未描画） |

## アプリの画面だけ page（app/）

chrome（タイトル・説明・ベゼル）を一切表示しない**画面そのもの**の page 群。Remix の起点はここ。

- `app/App.html`（全体・実遷移付き）/ `QuestPast` / `Splash` / `Onboarding` / `StoryViewer` / `PostFlow` / `Profile` / `ChatList` / `ChatRoom` = canonical specimen の **screen-only モード**（`?screen` + `?view=` deep link）への薄い iframe ラッパー（本体は handoff/ の単一ソースのまま）
- `app/CircleCreate.html` / `AuthOverlay.html` / `Drafts.html` = specimen が無かった画面の新規 screen-only 実装（CircleCreate は実 MapLibre positron）
- specimen 側の対応: UniverseQuest に `?view=` deep link、SplashView / StoryOverlay(clean) に screen-only モードを追加（Onboarding / UniversePostFlow は既存）

## 運用ルール

- **Flutter 実装が正**。specimen を直したら design-to-flutter で実装に入れ、実装が確定したら `/design-baseline` でここを更新する（逆流禁止）
- 新機能の発想は Claude Design 上で `Baseline.html` を見て現状を掴み、対象画面の canonical specimen（表の該当行）を Remix して始める
- shots は再生成物。手で差し替えない（`/design-baseline` が lib-test スイートの実機撮影から作る）
