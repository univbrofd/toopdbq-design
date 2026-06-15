// ============================================================================
// map-core.js — MapLibre 本体・カメラ API・スタイル調整・補修の統合
//   (旧 config.js + map.js + zoom-bounds.js + camera-api.js + self-heal.js + style-tweaks.js)
//
// セクション:
//   [1] 定数 + URL クエリパラメータ初期化       (旧 config.js)
//   [2] MapLibre インスタンス生成 + handler 無効化 (旧 map.js)
//   [3] zoom 下限管理 + Flutter への range 通知   (旧 zoom-bounds.js)
//   [4] Flutter から呼ばれる camera 操作 API     (旧 camera-api.js)
//   [5] transform 異常時の self-heal             (旧 self-heal.js)
//   [6] Liberty スタイル調整 (ラベル縮小・道路 shield 非表示・3D 建物 toggle)
//                                                (旧 style-tweaks.js)
// ============================================================================

// ===== [1] 定数 + URL クエリ ================================================

const BASE_ZOOM = 6.4;
// viewScale (Flutter Transform.scale) を廃止し、zoom 一本で米粒サイズまで縮小可能にする。
// zoom = -6 で球が画面サイズの ~1/64 (米粒サイズ)。
const ABS_MIN_ZOOM = -6.0;
const ABS_MAX_ZOOM = 16.0; // 街区レベル止まり (街路詳細は不要) — 3D 建物は pitch>0 のときのみ表示
const PITCH_START_ZOOM = 14.0; // この zoom 以上で pitch 自動許可
const PITCH_MAX_DEG = 85.0;    // MapLibre GL JS の上限値
// 初期 pitch (URL クエリ ?pitch= 未指定時のデフォルト)。
// Flutter 側の `EarthController.defaultPitch = 55.0` (= pitchSteps[1]) と一致させる。
// これを 0 にすると最初の 1 フレームだけ真俯瞰でレンダされ、Flutter onReady → setCamera で
// 55 にジャンプするタイミング差で「触るまで pitch が立たない」見え方になるため 55 で開始する。
const BASE_PITCH_DEG = 55.0;

// pitch から自動算出する padding.top (px)。pitch=PITCH_MAX_DEG → canvas 高さの 90%。
// MapLibre の setPadding(top) で球本体を画面下方にシフトさせ、pitch=85° のときに
// 地平線をさらに下げる効果。1.0 (canvas 高さ 100%) にすると球が画面外に押し出される
// ため上限手前 (0.90) で運用する。
const PAD_TOP_RATIO_AT_MAX = 0.4;

// activation circle として描画可能な半径上限。地球の四分の一周 (~5000km) を超えると
// 可視化を OFF にする (球面距離が広すぎて視覚的に意味がなくなるため)。
const MAX_ACTIVATION_VISUAL_KM = 5000;

// outer 半径以遠で頭打ちになる白フェードの最大 α。「うっすら」を意識して低めに設定。
const ACTIVATION_MASK_ALPHA_EDGE = 0.45;
const EARTH_R_KM = 6371.0;
const GLOBE_EDGE_KM = (Math.PI / 2) * EARTH_R_KM;

// ==== URL クエリパラメータ (Stagedeck から ?lat=...&lng=...&zoom=... 等) ====
const urlParams = new URLSearchParams(window.location.search);
function _qNum(key, def) {
  const v = urlParams.get(key);
  if (v == null || v === '') return def;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : def;
}
function _qStr(key, def) {
  const v = urlParams.get(key);
  return (v == null || v === '') ? def : v;
}

const initLat = _qNum('lat', 35.6754);
const initLng = _qNum('lng', 139.7060);
const initZoom = _qNum('zoom', BASE_ZOOM);
const initPitch = _qNum('pitch', BASE_PITCH_DEG);
const initBearing = _qNum('bearing', 0);
const initPinSeed = _qStr('pinSeed', '');
// padding (px) — 中心の表示位置を画面内でずらす。0 で従来通り。
const initPadTop = _qNum('padTop', 0);
const initPadBottom = _qNum('padBottom', 0);
const initPadLeft = _qNum('padLeft', 0);
const initPadRight = _qNum('padRight', 0);
const _hasInitPadding = (initPadTop || initPadBottom || initPadLeft || initPadRight) !== 0;
const initPinCount = _qNum('pinCount', 0);

// ===== [2] MapLibre インスタンス生成 ========================================

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/positron',
  // Three.js custom layer (models.js) が GL コンテキストを共有して 3D を描くため必須。
  // 無いと custom layer の render 出力が地図キャンバスに合成されず不可視になる。
  antialias: true,
  center: [initLng, initLat],
  zoom: initZoom,
  minZoom: ABS_MIN_ZOOM,
  maxZoom: ABS_MAX_ZOOM,
  bearing: initBearing,
  pitch: initPitch,
  // ドラッグ上限を 55° に固定 (Flutter EarthController.absMaxPitch と一致)。
  // paddingTopForPitch の正規化分母 PITCH_MAX_DEG (=85) は別管理で動作維持。
  maxPitch: 55,
  minPitch: 0,
  bearingSnap: 0,
  pixelRatio: (window.devicePixelRatio || 1),
  interactive: false,
  // ユーザー要請により帰属表示を非表示。OSM/OpenFreeMap/OpenMapTiles の利用規約上、
  // 別の場所 (アプリの About / Credits 等) でクレジット表示を行うこと。
  attributionControl: false,
});

// 全 maplibre 標準ハンドラ完全 disable
[
  'scrollZoom', 'boxZoom', 'dragRotate', 'dragPan', 'keyboard',
  'doubleClickZoom', 'touchZoomRotate', 'touchPitch',
].forEach((k) => {
  try { map[k] && map[k].disable && map[k].disable(); } catch (_) {}
});

// ===== [3] zoom 下限管理 ====================================================

// 設計: zoom 下限は ABS_MIN_ZOOM 固定。「球径 ≥ 短辺/2」の動的制限は廃止し、
// 球が画面の点になるまで MapLibre 側で連続縮小できる。
let dynamicZoomMin = ABS_MIN_ZOOM;

function recomputeDynamicZoomMin() {
  dynamicZoomMin = ABS_MIN_ZOOM;
}

function enforceMinZoom() {
  const cur = map.getZoom();
  if (cur < dynamicZoomMin) {
    map.jumpTo({ zoom: dynamicZoomMin });
  }
}

function postZoomRange() {
  _sendToHost(JSON.stringify({
    type: 'zoomRange',
    zoomMin: dynamicZoomMin,
    zoomMax: ABS_MAX_ZOOM,
    baseZoom: BASE_ZOOM,
  }));
}

// ===== [4] camera 操作 API ==================================================

window.setCamera = function(opts) {
  try {
    if (!opts) return;
    const target = {};
    if (typeof opts.zoom === 'number') {
      target.zoom = Math.max(dynamicZoomMin, Math.min(ABS_MAX_ZOOM, opts.zoom));
    }
    if (typeof opts.lat === 'number' && typeof opts.lng === 'number') {
      target.center = [opts.lng, opts.lat];
    }
    if (typeof opts.pitch === 'number') {
      const p = Math.max(0, Math.min(PITCH_MAX_DEG, opts.pitch));
      target.pitch = p;
      target.padding = { top: paddingTopForPitch(p), bottom: 0, left: 0, right: 0 };
    }
    dlog('set-camera-called', {
      reqZoom: opts.zoom,
      reqPitch: opts.pitch,
      hasCenter: typeof opts.lat === 'number',
      curZoomBefore: map.getZoom(),
      curPitchBefore: map.getPitch(),
    });
    if (Object.keys(target).length > 0) {
      map.jumpTo(target);
      dlog('post-set-camera', {
        zoom: map.getZoom(),
        pitch: map.getPitch(),
      });
    }
  } catch (e) {
    console.error('setCamera error', e);
  }
};

// pitch から自動算出する padding.top (px)。
// MapLibre の pitch 上限 (85°) で「地平線をさらに下げたい」を、padding で疑似的に
// 画面表示自体を下にシフトすることで実現する (球本体が画面下半分に降りる)。
function paddingTopForPitch(p) {
  const canvas = map.getCanvas();
  const h = canvas.clientHeight || 0;
  if (h <= 0) return 0;
  const ratio = Math.max(0, Math.min(1, p / PITCH_MAX_DEG));
  return h * PAD_TOP_RATIO_AT_MAX * ratio;
}

// 2 本指縦ドラッグから pitch を更新する。
// pitch = 0 は真上から見下ろし、pitch = PITCH_MAX_DEG (85°) は水平に近い飛行視点。
// pitch に応じて padding.top を自動調整 (球を画面下方にシフト = 地平線を下げる効果)。
window.setPitch = function(pitchDeg) {
  try {
    if (typeof pitchDeg !== 'number') return;
    const p = Math.max(0, Math.min(PITCH_MAX_DEG, pitchDeg));
    const padTop = paddingTopForPitch(p);
    map.jumpTo({
      pitch: p,
      padding: { top: padTop, bottom: 0, left: 0, right: 0 },
    });
  } catch (e) {
    console.error('setPitch error', e);
  }
};

window.earthPanBy = function(dx, dy) {
  try {
    map.panBy([dx, dy], { duration: 0 });
  } catch (e) {
    console.error('earthPanBy error', e);
  }
};

// 中心緯度経度を直接設定 (Flutter から現在位置を渡す用)。jumpTo の即時移動。
// アニメは Flutter 側 Ticker (EarthController.flyTo) が本 API を毎フレーム連打して実現。
window.setCenter = function(latDeg, lngDeg) {
  try {
    const c = map.getCenter();
    const lat = (typeof latDeg === 'number') ? latDeg : c.lat;
    const lng = (typeof lngDeg === 'number') ? lngDeg : c.lng;
    map.jumpTo({ center: [lng, lat] });
  } catch (e) {
    console.error('setCenter error', e);
  }
};

// ===== [5] self-heal ========================================================

// MapLibre 内部 transform 異常時の自己修復。
// globe projection + 高 pitch + 高速 panBy で getZoom() / center.lat が範囲外値
// (例: -2.5 / ±90近傍) を返す状態に陥ることがある (一度起きると永続的に連鎖変動)。
//
// 対策:
//  1. zoom が範囲外なら jumpTo で強制 ABS_MIN_ZOOM..ABS_MAX_ZOOM に
//  2. center.lat が ±80 を超えたら ±80 に強制 (極点近傍が transform 不安定の主因)

function selfHealMap() {
  try {
    let needFix = false;
    const fix = {};
    const z = map.getZoom();
    if (!Number.isFinite(z) || z < ABS_MIN_ZOOM - 0.01 || z > ABS_MAX_ZOOM + 0.01) {
      fix.zoom = Math.max(
        ABS_MIN_ZOOM,
        Math.min(ABS_MAX_ZOOM, Number.isFinite(z) ? z : ABS_MIN_ZOOM),
      );
      dlog('zoom-self-heal', { from: z, to: fix.zoom });
      needFix = true;
    }
    const c = map.getCenter();
    const MAX_LAT = 80;
    if (Math.abs(c.lat) > MAX_LAT) {
      const lat2 = Math.sign(c.lat) * MAX_LAT;
      fix.center = [c.lng, lat2];
      dlog('center-self-heal', { fromLat: c.lat, toLat: lat2 });
      needFix = true;
    }
    if (needFix) map.jumpTo(fix);
  } catch (e) {
    console.error('selfHealMap error', e);
  }
}

// ===== [6] Liberty スタイル調整 =============================================

// 国名・都道府県・都市・首都・大陸ラベルを固定 px に上書き。
// 低 zoom で目立つ「Tokyo 東京都」等の文字を縮小する目的。
function shrinkPlaceLabels(px) {
  const layers = (map.getStyle() && map.getStyle().layers) || [];
  const allSymbolIds = layers.filter((l) => l.type === 'symbol').map((l) => l.id);
  dlog('all-symbol-layers', { ids: allSymbolIds });
  const keywords = ['place', 'country', 'state', 'city', 'capital', 'town', 'continent'];
  const applied = [];
  for (const layer of layers) {
    if (layer.type !== 'symbol') continue;
    const id = layer.id.toLowerCase();
    if (!keywords.some((k) => id.includes(k))) continue;
    try {
      map.setLayoutProperty(layer.id, 'text-size', px);
      applied.push(layer.id);
    } catch (_) {}
  }
  dlog('place-labels-shrunk', { px, applied });
}

// 3D 建物 (fill-extrusion レイヤ) の表示 ON/OFF を切り替える。
// pitch=0 のとき真上から見ているので 3D 描画は無駄 → 非表示にして GPU を節約。
let _extrusionVisible = null; // null=未確定, true/false=現在の状態
function setExtrusionVisibility(visible) {
  if (_extrusionVisible === visible) return; // no-op
  const layers = (map.getStyle() && map.getStyle().layers) || [];
  const applied = [];
  for (const layer of layers) {
    if (layer.type !== 'fill-extrusion') continue;
    try {
      map.setLayoutProperty(layer.id, 'visibility', visible ? 'visible' : 'none');
      applied.push(layer.id);
    } catch (_) {}
  }
  _extrusionVisible = visible;
  dlog('extrusion-visibility', { visible, applied });
}

// 道路番号 shield ラベル (例: "B" "357" "C2") を非表示。
function hideRoadShields() {
  const layers = (map.getStyle() && map.getStyle().layers) || [];
  const keywords = [
    'shield', 'route', 'highway_shield', 'highway-shield',
    'road_shield', 'road-shield', 'roadname_shield',
  ];
  const applied = [];
  for (const layer of layers) {
    if (layer.type !== 'symbol') continue;
    const id = layer.id.toLowerCase();
    if (!keywords.some((k) => id.includes(k))) continue;
    try {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
      applied.push(layer.id);
    } catch (_) {}
  }
  dlog('road-shields-hidden', { applied });
}
