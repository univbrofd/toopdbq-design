/**
 * WdTimelinePost — タイムライン（ライトモード）のリスト行セル。
 * 1行 = 1投稿。アバター44 / 名前=主役 / 本文 / 写真1〜2枚 / アクション。
 * glass: no(perf) — リストセルなので liquid glass は使わない（taste.md のガラス予算）。
 */
export interface WdTimelinePostProps {
  /** アバター画像 URL（assets/images/user/*.jpg） */
  avatar: string;
  /** 表示名（主役・Noto Sans JP 700 / 15px） */
  name: string;
  /** @handle（Inter 13 / 黒56%） */
  handle?: string;
  /** 相対時刻。例: "8分" */
  time?: string;
  /** 本文（Noto Sans JP 15 / 1.75） */
  body?: string;
  /** 投稿写真 URL。最大2枚まで表示（1枚=h320 / 2枚=h220 の2分割） */
  media?: string[];
  comments?: number;
  likes?: number;
  /** like 済み。アイコンとカウントがブランドピンク #ff3e88 になる */
  liked?: boolean;
  /** 共有ラベル。既定 "共有" */
  shareLabel?: string;
  /** 白 PNG アイコンのディレクトリ。既定 "assets/icons" */
  iconBase?: string;
  onComment?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  style?: React.CSSProperties;
}
export declare function WdTimelinePost(props: WdTimelinePostProps): JSX.Element;
