// ============================================================================
// pins.js — pin データ管理 + 投影計算 + 地平線サンプリング + 互換スタブ
//   (旧 pins-store.js + seed-pins.js + horizon.js + projection.js + activation-mask.js)
//
// セクション:
//   [1] pins[] と window.setPins                   (旧 pins-store.js)
//   [2] Stagedeck デバッグ用 seed pin              (旧 seed-pins.js)
//   [3] 地平線 (horizon) screen サンプリング        (旧 horizon.js)
//                                                  ※ _isOnGlobe は overlay.js (strato) も参照
//   [4] pin 投影 + Flutter への projection 通知     (旧 projection.js)
//   [5] window.setActivationRange の no-op スタブ   (旧 activation-mask.js)
// ============================================================================

// ===== [1] pins[] + 受信 API ================================================

let pins = [];

window.setPins = function(payload) {
  try {
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const list = data.pins || data.stories || [];
    pins = list.map((p, i) => ({ index: i, lat: p[0], lng: p[1] }));
    postProjections();
  } catch (e) {
    console.error('setPins error', e);
  }
};

// ===== [2] Stagedeck デバッグ用 seed pin ====================================

// 簡易 PRNG (mulberry32) で seed → 一様分布の擬似 pin
function _seedRand(seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let s = h >>> 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function _spawnSeedPins(seed, count, centerLat, centerLng) {
  const rnd = _seedRand(seed);
  // 中心から半径 ~5° の範囲に分布 (おおよそ 500km 圏)
  const arr = [];
  for (let i = 0; i < count; i++) {
    const dLat = (rnd() - 0.5) * 10;
    const dLng = (rnd() - 0.5) * 10;
    arr.push([centerLat + dLat, centerLng + dLng]);
  }
  pins = arr.map((p, i) => ({ index: i, lat: p[0], lng: p[1] }));
  // MapLibre 標準 marker でラフ描画 (Stagedeck 視認用)
  arr.forEach((p) => {
    const el = document.createElement('div');
    el.style.cssText = 'width:10px;height:10px;border-radius:99px;background:#ff5577;border:1.5px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.6);';
    new maplibregl.Marker({ element: el }).setLngLat([p[1], p[0]]).addTo(map);
  });
  dlog('seed-pins', { count, seed });
}

// ===== [3] 地平線 (horizon) サンプリング ====================================
// 画面 X 軸方向に N+1 サンプリングし、各 X で「画面上端 → 画面下端」を二分探索して
// 「unproject 有効な最上 Y」(= 地平線の screen 上の位置) を求める。
// globe / mercator 投影の双方で動作する。
// strato-overlay (overlay.js) が _isOnGlobe を limb 二分探索に使用する。

const _ROUNDTRIP_TOL2 = 9; // 3px 二乗

function _isOnGlobe(x, y) {
  const ll = map.unproject([x, y]);
  if (!ll || !isFinite(ll.lat) || !isFinite(ll.lng)) return false;
  // Web Mercator 上限 (±85.05113°) を超えると地球外領域
  if (Math.abs(ll.lat) > 85.06) return false;
  const back = map.project([ll.lng, ll.lat]);
  if (!back || !isFinite(back.x) || !isFinite(back.y)) return false;
  const ddx = back.x - x, ddy = back.y - y;
  return (ddx * ddx + ddy * ddy) <= _ROUNDTRIP_TOL2;
}

function measureHorizon() {
  const canvasEl = (typeof map.getCanvas === 'function') ? map.getCanvas() : null;
  const w = canvasEl ? (canvasEl.clientWidth || canvasEl.width || 0) : 0;
  const h = canvasEl ? (canvasEl.clientHeight || canvasEl.height || 0) : 0;
  if (w <= 0 || h <= 0) return { points: [], canvasW: 0, canvasH: 0 };

  const SAMPLES = 80;
  const points = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const x = (i / SAMPLES) * w;
    if (!_isOnGlobe(x, h - 1)) {
      // 画面下端も宇宙 → この x は完全に宇宙
      points.push({ x, y: h, valid: false, clamped: false });
      continue;
    }
    if (_isOnGlobe(x, 0)) {
      // 画面上端も地表 → horizon は画面より上に出ている。
      // 影 (#globe-shadow) を継続表示するため画面上端 (y=0) にクランプして valid 扱い。
      // 高 pitch + 高 zoom で「影が消える」現象を防ぐ。
      points.push({ x, y: 0, valid: true, clamped: true });
      continue;
    }
    let lo = 0, hi = h - 1;
    for (let k = 0; k < 22 && (hi - lo) > 0.5; k++) {
      const mid = (lo + hi) * 0.5;
      if (_isOnGlobe(x, mid)) hi = mid; else lo = mid;
    }
    points.push({ x, y: hi, valid: true, clamped: false });
  }
  return { points, canvasW: w, canvasH: h };
}

function _validSegmentsFromHorizon(points) {
  const segs = [];
  let cur = null;
  for (const p of points) {
    if (p.valid) {
      if (!cur) { cur = { pts: [], closed: false }; segs.push(cur); }
      cur.pts.push(p);
    } else {
      cur = null;
    }
  }
  return segs.filter(s => s.pts.length >= 2);
}

// open / closed どちらにも対応する Catmull-Rom スプライン path d 生成。
function _smoothPathDForSegment(seg) {
  const pts = seg.pts;
  const closed = seg.closed;
  const n = pts.length;
  if (n < 2) return '';
  if (n === 2) {
    return 'M ' + pts[0].x.toFixed(2) + ' ' + pts[0].y.toFixed(2)
         + ' L ' + pts[1].x.toFixed(2) + ' ' + pts[1].y.toFixed(2);
  }
  let d = 'M ' + pts[0].x.toFixed(2) + ' ' + pts[0].y.toFixed(2);
  if (closed) {
    const get = (i) => pts[((i % n) + n) % n];
    for (let i = 0; i < n; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ' C ' + c1x.toFixed(2) + ' ' + c1y.toFixed(2)
         + ' ' + c2x.toFixed(2) + ' ' + c2y.toFixed(2)
         + ' ' + p2.x.toFixed(2) + ' ' + p2.y.toFixed(2);
    }
    d += ' Z';
  } else {
    const get = (i) => {
      if (i < 0) {
        return { x: 2 * pts[0].x - pts[1].x, y: 2 * pts[0].y - pts[1].y };
      }
      if (i > n - 1) {
        return {
          x: 2 * pts[n - 1].x - pts[n - 2].x,
          y: 2 * pts[n - 1].y - pts[n - 2].y,
        };
      }
      return pts[i];
    };
    for (let i = 0; i < n - 1; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ' C ' + c1x.toFixed(2) + ' ' + c1y.toFixed(2)
         + ' ' + c2x.toFixed(2) + ' ' + c2y.toFixed(2)
         + ' ' + p2.x.toFixed(2) + ' ' + p2.y.toFixed(2);
    }
  }
  return d;
}

function _horizonStrokeD(segs) {
  let d = '';
  for (const seg of segs) {
    const sd = _smoothPathDForSegment(seg);
    if (sd) d += (d ? ' ' : '') + sd;
  }
  return d;
}

function _horizonGlowD(segs) {
  // 各弧について horizon 線を描いた後、最後の x で画面上端へ、
  // 最初の x の上端へ戻って閉じる。
  let d = '';
  for (const seg of segs) {
    const sd = _smoothPathDForSegment(seg);
    if (!sd) continue;
    const last = seg.pts[seg.pts.length - 1];
    const first = seg.pts[0];
    d += (d ? ' ' : '')
       + sd
       + ' L ' + last.x.toFixed(2) + ' 0'
       + ' L ' + first.x.toFixed(2) + ' 0'
       + ' Z';
  }
  return d;
}

// ===== [4] pin 投影 + projection 通知 =======================================

function angularDistRad(lat1, lng1, lat2, lng2) {
  const toRad = Math.PI / 180;
  const a = lat1 * toRad;
  const b = lat2 * toRad;
  const dLng = (lng2 - lng1) * toRad;
  const c = Math.sin(a) * Math.sin(b) + Math.cos(a) * Math.cos(b) * Math.cos(dLng);
  return Math.acos(Math.max(-1, Math.min(1, c)));
}

// 球の半径 (px) を 1 サンプルで計測。globe projection なら center から
// 90° 離れた point の投影距離が見かけ半径と等しい。
function measureSphereRadius(centerLng, centerLat) {
  try {
    const cp = map.project([centerLng, centerLat]);
    const lat1 = centerLat * Math.PI / 180;
    const lng1 = centerLng * Math.PI / 180;
    const ad = (89.0) * Math.PI / 180;
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(ad) + Math.cos(lat1) * Math.sin(ad));
    const lng2 = lng1;
    const lp = map.project([lng2 * 180 / Math.PI, lat2 * 180 / Math.PI]);
    return Math.hypot(lp.x - cp.x, lp.y - cp.y);
  } catch (_) {
    return 0;
  }
}

// 中心緯度近傍で「地表 1 km が screen 上で何 px か」を実測。
// globe / mercator どちらの投影でも MapLibre 内部の project() が正しい
// px を返すため、cluster 半径の換算基準として使える。
function measurePxPerKm(centerLng, centerLat) {
  try {
    const cp = map.project([centerLng, centerLat]);
    const dLat = 1.0 / 110.574;
    const np = map.project([centerLng, centerLat + dLat]);
    const d = Math.hypot(np.x - cp.x, np.y - cp.y);
    return isFinite(d) && d > 0 ? d : 0;
  } catch (_) {
    return 0;
  }
}

function postProjections() {
  const canvas = map.getCanvas();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const center = map.getCenter();
  const sphereR = measureSphereRadius(center.lng, center.lat);
  const pxPerKm = measurePxPerKm(center.lng, center.lat);
  const sphereC = map.project([center.lng, center.lat]);

  // 球面 3D で「カメラ向き hemisphere」を計算する。
  // pitch=0 なら target 真上、pitch=85 なら target の南側に倒れる (bearing=0 前提)。
  // pin が camera 側 hemisphere に居る (= dot > threshold) なら可視扱い。
  const toRadC = Math.PI / 180;
  const clat = center.lat * toRadC;
  const clng = center.lng * toRadC;
  const pitchRad = (map.getPitch() || 0) * toRadC;
  const cosClat = Math.cos(clat);
  const sinClat = Math.sin(clat);
  const cosClng = Math.cos(clng);
  const sinClng = Math.sin(clng);
  // target 単位ベクトル
  const ctX = cosClat * cosClng;
  const ctY = cosClat * sinClng;
  const ctZ = sinClat;
  // local south tangent at target (bearing=0 で camera は target の南に倒れる)
  const sthX = sinClat * cosClng;
  const sthY = sinClat * sinClng;
  const sthZ = -cosClat;
  // camera direction from globe center
  const cdX = ctX * Math.cos(pitchRad) + sthX * Math.sin(pitchRad);
  const cdY = ctY * Math.cos(pitchRad) + sthY * Math.sin(pitchRad);
  const cdZ = ctZ * Math.cos(pitchRad) + sthZ * Math.sin(pitchRad);

  // pins を Float32Array に直接書き込んで Base64 化する。
  // JSON.stringify(pins: [{...}]) より 1 pin あたり 約 3x 小さく、
  // Flutter 側の jsonDecode を Float32List.view (~20x 高速) に置換できる。
  // STRIDE 内訳: index, x, y, angDist, visible(0/1), upDx, upDy, scale
  const n = pins.length;
  const STRIDE = 8;
  const buf = new Float32Array(n * STRIDE);
  for (let i = 0; i < n; i++) {
    const p = pins[i];
    const sp = map.project([p.lng, p.lat]);
    const ang = angularDistRad(center.lat, center.lng, p.lat, p.lng);
    const plat = p.lat * toRadC;
    const plng = p.lng * toRadC;
    const pCos = Math.cos(plat);
    const pX = pCos * Math.cos(plng);
    const pY = pCos * Math.sin(plng);
    const pZ = Math.sin(plat);
    const camDot = pX * cdX + pY * cdY + pZ * cdZ;
    const visible = (camDot > 0.04 &&
        sp.x >= -8 && sp.x <= w + 8 &&
        sp.y >= -8 && sp.y <= h + 8) ? 1 : 0;
    const vx = sp.x - sphereC.x;
    const vy = sp.y - sphereC.y;
    const vlen = Math.hypot(vx, vy);
    const upDx = vlen > 0.001 ? vx / vlen : 0;
    const upDy = vlen > 0.001 ? vy / vlen : -1;
    const off = i * STRIDE;
    buf[off + 0] = p.index;
    buf[off + 1] = sp.x;
    buf[off + 2] = sp.y;
    buf[off + 3] = ang;
    buf[off + 4] = visible;
    buf[off + 5] = upDx;
    buf[off + 6] = upDy;
    buf[off + 7] = Math.cos(ang);
  }
  // chunked btoa: String.fromCharCode.apply は引数 N が大きいとスタック溢れする
  // ため 32KB ずつ分割。Float32Array の little-endian は x86/ARM 共通で
  // Flutter 側 Float32List.view と互換。
  const bytes = new Uint8Array(buf.buffer);
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(
      null, bytes.subarray(i, Math.min(i + CHUNK, bytes.length))
    );
  }
  const pinsB64 = btoa(bin);

  _scheduleGlobeOverlayIdle();

  // viewportBounds: MapLibre の getBounds() で「画面に映る最小 axis-aligned bbox」
  // を取得して Flutter に送る。Universe のタイルキャッシュ層がこれを基準に
  // 画面 ×2 範囲のタイル集合を算出する。pitch=85° / globe で画面が広い場合も
  // getBounds() は適切に広い bbox を返す。失敗時は null (Flutter 側は pxPerKm
  // + canvas からの近似 fallback を使う)。
  let viewportBounds = null;
  try {
    const b = map.getBounds();
    if (b) {
      viewportBounds = {
        swLat: b.getSouth(),
        swLng: b.getWest(),
        neLat: b.getNorth(),
        neLng: b.getEast(),
      };
    }
  } catch (_) {}

  _sendToHost(JSON.stringify({
    type: 'projection',
    width: w,
    height: h,
    sphereRadiusPx: sphereR,
    sphereCenterX: sphereC.x,
    sphereCenterY: sphereC.y,
    pxPerKm,
    centerLat: center.lat,
    centerLng: center.lng,
    zoom: map.getZoom(),
    pinsCount: n,
    pinsStride: STRIDE,
    pinsB64,
    viewportBounds,
  }));
}

// ===== [5] window.setActivationRange no-op スタブ ===========================
// 旧仕様: zoom 連動の outer/inner km を canvas radial-gradient で可視化していた。
// v113 で center-overlay の center-marker に統合・置き換え。
// Flutter 側 `EarthController._sendActivationRange` は zoom 変化のたびに本関数を
// 呼ぶため、削除すると JS 側で undefined ref になる。受け取りだけ行って捨てる。

window.setActivationRange = function (_args) {
  // intentionally no-op
};

// init の旧経路用 (現在は誰も呼ばないが互換維持)
function _scheduleActivationMaskRedraw(_reason) {}
function _refreshActivationCircles() {}
function _resizeActivationMaskCanvas() {}
