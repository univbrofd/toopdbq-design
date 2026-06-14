# SplashView — handoff

アプリ起動時のスプラッシュ。重ブラー auth_background ＋ teal tint の上に小さな白ロゴ（バラのマーク）だけが
中央でゆっくり呼吸し、終わると持ち上がるように消えてホームへ受け渡す。

## 中身

- `comp-splash-view.html` — specimen（393×852 phone frame、boot シーケンスの replay つき）

css / 画像は複製せず共有を参照する（`../../DesignSystem/colors_and_type.css`、`../../assets/images/`）。

## 由来

Claude Design bundle `flutter-splash`（project 名「Flutter Splash画面」、主 specimen `SplashView.html`）。
最終イテレーションの着地: **アプリ名テキストなし／白ロゴのみ・42px・呼吸アニメ・終了後は真っ黒**。
（途中イテレーションの cyan ワードマークやテーマグラデーション版は破棄済み。screenshots/ は stale。）

## 一次情報（実値）

- 背景: `auth_background.png` を全面ブラー（CSS `blur(34px) saturate(108%)` ≈ Flutter `ImageFilter.blur(32)`）、`inset:-16%` で外周を隠す
- tint: `rgba(25,134,121,.20)` = `Color(0xFF198679).withOpacity(.2)`（DS secondary teal）
- vignette: `radial-gradient(72% 56% at 50% 47%, transparent 38%, rgba(0,0,0,.34) 100%)`
- マーク: `logo_toopdbq.png`（白いバラ）`width:42px`／`drop-shadow(0 6px 22px rgba(0,0,0,.45))`／**ワードマーク無し**
- 入場 `markIn`: 1200ms `cubic-bezier(.16,1,.3,1)`、opacity 0→1・scale .965→1・blur 6→0
- 呼吸 `breathe`: 3.6s `--ease-standard` 無限、opacity .92↔1・scale 1↔1.035
- 退場 `splashOut`: .7s、opacity→0・scale→1.06・blur→4（持ち上げて消える）
- boot dots ＋ status はプロトタイプ演出（実機は出さない＝whisper-quiet）。`black-screen` 後背もプロトタイプ専用

## 実装の着地

- 中央マークを「グラデ T ボックス＋Pacifico ワードマーク」→ **白ロゴ 42px・テキスト無し・呼吸アニメ** に置換 → `lib/feature/Splash/SplashView.dart`
- vignette を design 値（`.34` 終端の楕円 scrim）へ寄せる
- 遷移は実装が単一の正（`AppStateController.ready` でホーム＝Universe を前面化）。プロトタイプの「終了後 真っ黒」は採らない
