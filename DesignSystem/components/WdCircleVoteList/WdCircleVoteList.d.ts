/**
 * WdCircleVoteList — サークルの名前をユーザーみんなで決めるための投票リスト。タイムライン画面の前面に出す。
 * 縦に候補のサークル名が並び、右端にグッドボタン（icon_good ＝サムズアップ / like のハートとは別用途）。
 * ボタンのカウントは押すと +1（再タップで取り消し）。並び順は常にグッドの多い順で、
 * 順位が入れ替わると FLIP で行が滑って動く。
 * glass: no(perf) — リストセルなので liquid glass は使わない（taste.md のガラス予算）。
 * 面はライトモード（#fff・タイムライン本体と同じ）、背後は --scrim-min（黒45%）。
 * アクセントは 1 箇所だけ — 1 位の順位数字にブランドグラデ。投票済みは黒 pill ＋白文字。
 */
export interface WdCircleNameCandidate {
  /** 一意キー。投票状態と FLIP の同一性に使う */
  id: string;
  /** 候補のサークル名（Noto Sans JP 700 / 15px・1行で省略） */
  name: string;
  /** 補足 1 行（Inter 12 / 黒56%）。提案者と時刻。例: "SunnyVi · 3時間前" */
  meta?: string;
  /** 初期グッド数 */
  goods?: number;
  /** 自分が既にグッド済みか */
  voted?: boolean;
}
export interface WdCircleVoteListProps {
  candidates: WdCircleNameCandidate[];
  /** 旧名（互換）。candidates が未指定のときだけ使われる */
  circles?: WdCircleNameCandidate[];
  /** シート見出し。既定 "サークル名を投票" */
  title?: string;
  /** 見出し下の 1 行説明 */
  subtitle?: string;
  /** 最下部の注記（締切・1人1票など）。省略すると足を出さない */
  note?: string;
  /** 左の順位数字を出す。既定 true（1 位のみブランドグラデ） */
  showRank?: boolean;
  /** 白 PNG アイコンのディレクトリ。既定 "assets/icons" */
  iconBase?: string;
  /** true でスクリムを持たない素のリスト面として描く（specimen / 埋め込み用） */
  inline?: boolean;
  /** グッドが押されたとき（カウントは内部で先に更新される） */
  onVote?: (candidate: WdCircleNameCandidate) => void;
  /** 閉じる（× またはスクリムのタップ） */
  onClose?: () => void;
  style?: React.CSSProperties;
}
export declare function WdCircleVoteList(props: WdCircleVoteListProps): JSX.Element;
