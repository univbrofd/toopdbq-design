/**
 * WdQuestPostBoard — クエスト投稿ボードの**レイアウト仕様**（配置アルゴリズム）。
 *
 * 横スクロールの1本のボード。高さ固定・幅は投稿数だけ右へ伸びる。ボードを「列」
 * 単位で左から右へ埋め、列同士は X が重ならないので列内で縦に積むだけで全体の
 * 非重複が保証される。タイルは position:absolute の px 指定（CSS grid は使わない）。
 *
 * 定数: GAP 7 / PAD 10 / PAD_TOP 41 / MAXW 244 / 列の有効高 H = 高さ − PAD_TOP − PAD。
 * アスペクト比は P（縦 9:16）と L（横 16:9）の2種のみ。列パターンは 11 種
 * （A・AL・B・C・C3・D・E・F・G・H・I）で、どれも高さぴったり H になるよう
 * 比を保ったまま連立式を解く（式は `WdQuestPostBoardPatterns[id].formula`）。
 *
 * 設計点: MAXW=244 は **H≈280（ボード高 331）** で 11 パターン全部が無クランプで
 * 収まる値。これより高いボードでは L を含む列が MAXW に当たり、縮小＋縦中央寄せ
 * になる（仕様どおりの挙動）。
 *
 * radius 既定 14px は仕様値だが DS の 5 段スケール（8/12/16/24/pill）外 —
 * 本番投入時は `--radius-sm`(12) / `--radius-md`(16) に寄せるのが taste.md 準拠。
 * glass: no(perf) — グリッドのセルなので liquid glass は載せない。
 */

/** タイルのアスペクト比種別。P = 縦 9:16 / L = 横 16:9 */
export type WdQuestPostBoardKind = 'P' | 'L';
/** 列パターン ID。A / AL は投稿が1枚しか残らない時のフォールバック */
export type WdQuestPostBoardPatternId = 'A' | 'AL' | 'B' | 'C' | 'C3' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I';

/** 配置済みタイル1枚（px 絶対座標・ボード左上原点） */
export interface WdQuestPostBoardTile {
  x: number; y: number; w: number; h: number;
  kind: WdQuestPostBoardKind;
  /** 何列目に属するか（0 始まり） */
  col: number;
  pattern: WdQuestPostBoardPatternId;
  /** 投稿の通し番号（0 始まり・左の列から順）。タイル総数は count と一致する */
  i: number;
}

/** 1列の結果。scale<1 = MAXW / 90% ルールで縮小された列（→ 縦中央寄せ） */
export interface WdQuestPostBoardColumn {
  pattern: WdQuestPostBoardPatternId;
  x: number; y: number; w: number; h: number;
  scale: number;
  /** ぴったり埋まった列に加えた縦ジッター（0〜GAP×1.6px） */
  jitter: number;
  count: number;
}

export interface WdQuestPostBoardLayoutResult {
  tiles: WdQuestPostBoardTile[];
  columns: WdQuestPostBoardColumn[];
  /** ボード総幅（= scrollWidth。PAD 込み） */
  width: number;
  height: number;
  /** 列の有効高 H */
  contentHeight: number;
  spec: typeof WdQuestPostBoardSpec;
}

export interface WdQuestPostBoardLayoutOptions {
  /** 投稿数。タイル総数はこの値と一致する */
  count: number;
  /** ボード高（固定）。既定 331 = PAD_TOP 41 + H 280 + PAD 10 */
  height?: number;
  /** ボードの可視幅。列幅がこの 90% を超えたら列ごと縮小。0/未指定なら適用しない */
  viewportWidth?: number;
  /** 擬似乱数 seed（固定 = 再描画で配置が変わらない）。既定 20260803 */
  seed?: number;
  /** 列パターンの循環シーケンス。既定 ['B','F','C','D','H','G','C3','B','E','I','C','F'] */
  sequence?: WdQuestPostBoardPatternId[];
  /** 定数の部分上書き（GAP / PAD / PAD_TOP / MAXW / MAX_COL_RATIO / JITTER_GAPS） */
  spec?: Partial<typeof WdQuestPostBoardSpec>;
  /** パターン表の差し替え（検証・派生仕様用） */
  patterns?: typeof WdQuestPostBoardPatterns;
}

/** 定数と既定シーケンス（仕様の唯一の正） */
export declare const WdQuestPostBoardSpec: {
  GAP: number; PAD: number; PAD_TOP: number; MAXW: number; RADIUS: number;
  MAX_COL_RATIO: number; JITTER_GAPS: number; SEQUENCE: WdQuestPostBoardPatternId[];
};

/** 11 種の列パターン。`need`=必要枚数 / `kinds`=構成 / `formula`=寸法計算式 / `solve(H,G)` */
export declare const WdQuestPostBoardPatterns: Record<WdQuestPostBoardPatternId, {
  need: number; kinds: string; desc: string; formula: string;
  solve: (H: number, G: number) => { w: number; tiles: Omit<WdQuestPostBoardTile, 'col' | 'pattern' | 'i'>[] };
}>;

/** 配置本体（純関数・React / DOM 非依存 — 他言語へ移植するのはこれ） */
export declare function WdQuestPostBoardLayout(opts: WdQuestPostBoardLayoutOptions): WdQuestPostBoardLayoutResult;

export interface WdQuestPostBoardProps extends WdQuestPostBoardLayoutOptions {
  /** タイルの単色。既定 #333333（= --gray-800 プレースホルダ地） */
  tileColor?: string;
  /** タイル角丸。既定 14 */
  radius?: number;
  background?: string;
  /** 列の上（PAD_TOP 帯）にパターン ID を出す（仕様説明用） */
  showPatternLabels?: boolean;
  /** タイル中央に P / L を出す（仕様説明用） */
  showTileKinds?: boolean;
  /** 列の外形を破線で出す（仕様説明用） */
  showColumnGuides?: boolean;
  /** タイルの中身を差し込む。省略時は単色矩形のみ */
  renderTile?: (tile: WdQuestPostBoardTile) => React.ReactNode;
  onTileClick?: (tile: WdQuestPostBoardTile) => void;
  style?: React.CSSProperties;
  className?: string;
}

/** 単色タイルのプレビュー実装（配置の可視化。中身は renderTile で差し込む） */
export declare function WdQuestPostBoard(props: WdQuestPostBoardProps): JSX.Element;
