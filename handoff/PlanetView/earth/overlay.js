// ============================================================================
// overlay.js — DOM/SVG 装飾レイヤ + 起動 wiring
//   (旧 globe-overlay.js + strato-overlay.js + center-overlay.js + init.js)
//
// セクション:
//   [1] 旧 globe overlay 互換シム (空関数)        (旧 globe-overlay.js)
//   [2] 成層圏リング #strato-shadow + 球縁白線 #globe-frame
//                                                  (旧 strato-overlay.js)
//   [3] 地図中心の center-marker                   (旧 center-overlay.js)
//   [4] ResizeObserver + map event wiring + style.load 初期化
//                                                  (旧 init.js)
// ============================================================================

// ===== [1] 旧 globe overlay 互換シム =========================================
// 青グロー + 地平線白線は #strato-shadow + #globe-frame の円近似に置き換わり、
// strato (rAF live 追従) が同期更新する。関数名は projection.js / init.js から
// 参照されているため空シムとして残置。

function _scheduleGlobeOverlayIdle() {}
function _scheduleGlobeOverlayLive() {}
function updateGlobeOverlay() {}

// ===== [2] 成層圏リング + 球縁白線 ===========================================
// 設計方針:
//  - 球の見かけ縁 (limb) を「円」で近似し、CSS radial-gradient(circle at cx cy, ...)
//    の中心と半径を CSS 変数経由で毎フレ更新するだけ。
//  - limb 推定は球の見かけ中心から 8 方向だけ二分探索 → 3 点最小二乗で円フィット。
//    1 フレーム ~192 ops (現 measureHorizon の ~3500 ops の約 1/18)。
//  - 連続イベント (move/zoom/pitch/rotate) で rAF coalescing で毎フレ live 更新。
//  - WebGL は使わない (DOM のみ)。WKWebView/iframe/Web Stagedeck 完全互換。

const _stratoState = {
  rafPending: false,
  enabled: true,
  // 厚み (limb radius * thicknessRatio、最低 minThickness px、最大 maxThickness px)
  // ratio は 0.04 まで下げ、さらに maxThickness で頭打ちにする。
  // 拡大時 (r が大) に成層圏が上方向へ広がり過ぎる演出を抑制するため。
  // 旧値: ratio=0.08 / cap なし → r=2000 で W=160px と過激だった。
  thicknessRatio: 0.04,
  minThickness: 24,
  maxThickness: 64,
};

// `_isOnGlobe` (pins.js) を再利用して limb 境界を二分探索。
function _stratoFindLimbPointAlongRay(cx, cy, dx, dy, w, h) {
  const maxT = Math.hypot(w, h) * 1.2;
  let hi = 32;
  // hi が宇宙側になるまで指数で広げる
  for (let i = 0; i < 12; i++) {
    const x = cx + dx * hi, y = cy + dy * hi;
    if (!_isOnGlobe(x, y)) break;
    hi *= 1.5;
    if (hi >= maxT) { hi = maxT; break; }
  }
  if (_isOnGlobe(cx + dx * hi, cy + dy * hi)) return null; // 画面内に limb なし
  let lo = 0;
  for (let k = 0; k < 12; k++) {
    const mid = (lo + hi) * 0.5;
    if (_isOnGlobe(cx + dx * mid, cy + dy * mid)) lo = mid; else hi = mid;
  }
  return { x: cx + dx * lo, y: cy + dy * lo };
}

// 3 点以上から最小二乗で circle (cx, cy, r) を解く。
//   x^2 + y^2 + a x + b y + c = 0  →  cx = -a/2, cy = -b/2, r = sqrt(cx^2+cy^2 - c)
function _stratoFitCircle(points) {
  const n = points.length;
  if (n < 3) return null;
  let Sx = 0, Sy = 0, Sxx = 0, Syy = 0, Sxy = 0,
      Sz = 0, Sxz = 0, Syz = 0;
  for (const p of points) {
    const x = p.x, y = p.y, z = x * x + y * y;
    Sx += x; Sy += y;
    Sxx += x * x; Syy += y * y; Sxy += x * y;
    Sz += z; Sxz += x * z; Syz += y * z;
  }
  // 3x3 連立: [Sxx Sxy Sx; Sxy Syy Sy; Sx Sy n] * [a;b;c] = -[Sxz; Syz; Sz]
  const A00 = Sxx, A01 = Sxy, A02 = Sx;
  const A10 = Sxy, A11 = Syy, A12 = Sy;
  const A20 = Sx,  A21 = Sy,  A22 = n;
  const B0 = -Sxz, B1 = -Syz, B2 = -Sz;
  const det =
    A00 * (A11 * A22 - A12 * A21) -
    A01 * (A10 * A22 - A12 * A20) +
    A02 * (A10 * A21 - A11 * A20);
  if (Math.abs(det) < 1e-6) return null;
  function det3(b0, b1, b2, c0, c1, c2, d0, d1, d2) {
    return b0 * (c1 * d2 - c2 * d1)
         - b1 * (c0 * d2 - c2 * d0)
         + b2 * (c0 * d1 - c1 * d0);
  }
  const invDet = 1 / det;
  const a = det3(B0, A01, A02, B1, A11, A12, B2, A21, A22) * invDet;
  const b = det3(A00, B0, A02, A10, B1, A12, A20, B2, A22) * invDet;
  const c = det3(A00, A01, B0, A10, A11, B1, A20, A21, B2) * invDet;
  const cx = -a / 2, cy = -b / 2;
  const r2 = cx * cx + cy * cy - c;
  if (!(r2 > 0)) return null;
  return { cx, cy, r: Math.sqrt(r2) };
}

function _stratoUpdate() {
  const el = document.getElementById('strato-shadow');
  if (!el || !map) return;
  if (!_stratoState.enabled) {
    if (el.style.display !== 'none') el.style.display = 'none';
    const frameSvg = document.getElementById('globe-frame');
    if (frameSvg && frameSvg.style.display !== 'none') frameSvg.style.display = 'none';
    return;
  }
  const cv = map.getCanvas();
  if (!cv) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  if (w <= 0 || h <= 0) return;

  // 画面中心ではなく「球の見かけ中心 = map.getCenter() の screen projection」を起点に
  // limb 二分探索する。pitch があると球は画面下方にずれるため。
  const c = map.getCenter();
  const sp = map.project([c.lng, c.lat]);
  const cx0 = sp.x, cy0 = sp.y;

  const dirs = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [Math.SQRT1_2, Math.SQRT1_2], [-Math.SQRT1_2, Math.SQRT1_2],
    [Math.SQRT1_2, -Math.SQRT1_2], [-Math.SQRT1_2, -Math.SQRT1_2],
  ];
  const pts = [];
  for (const [dx, dy] of dirs) {
    const p = _stratoFindLimbPointAlongRay(cx0, cy0, dx, dy, w, h);
    if (p) pts.push(p);
  }

  // 円フィット (3 点以上必要)
  let circle = _stratoFitCircle(pts);

  // フォールバック: 円フィット失敗時は 4 軸の平均で粗く半径推定
  if (!circle && pts.length >= 1) {
    let sumR = 0, n = 0;
    for (const p of pts) {
      const dx = p.x - cx0, dy = p.y - cy0;
      sumR += Math.hypot(dx, dy);
      n++;
    }
    if (n > 0) circle = { cx: cx0, cy: cy0, r: sumR / n };
  }

  if (!circle || !isFinite(circle.r) || circle.r <= 4) {
    if (el.style.display !== 'none') el.style.display = 'none';
    const frameSvg = document.getElementById('globe-frame');
    if (frameSvg && frameSvg.style.display !== 'none') frameSvg.style.display = 'none';
    return;
  }

  const W = Math.min(
    _stratoState.maxThickness,
    Math.max(_stratoState.minThickness,
             circle.r * _stratoState.thicknessRatio));
  el.style.setProperty('--cx', circle.cx.toFixed(2));
  el.style.setProperty('--cy', circle.cy.toFixed(2));
  el.style.setProperty('--r',  circle.r.toFixed(2));
  el.style.setProperty('--w',  W.toFixed(2));
  if (el.style.display !== 'block') el.style.display = 'block';

  // 同じ (cx, cy, r) で globe-frame の白線円も更新する。
  // measureHorizon を使わないので毎フレ追従しても安価。
  const frameSvg = document.getElementById('globe-frame');
  const frameCircle = document.getElementById('globe-frame-circle');
  if (frameSvg && frameCircle) {
    const vb = '0 0 ' + w + ' ' + h;
    if (frameSvg.getAttribute('viewBox') !== vb) {
      frameSvg.setAttribute('viewBox', vb);
    }
    frameCircle.setAttribute('cx', circle.cx.toFixed(2));
    frameCircle.setAttribute('cy', circle.cy.toFixed(2));
    frameCircle.setAttribute('r',  circle.r.toFixed(2));
    if (frameSvg.style.display !== 'block') frameSvg.style.display = 'block';
  }
}

// rAF coalesce で 1 フレ 1 回に間引く。連続イベントを束ねる。
function _scheduleStratoLive() {
  if (_stratoState.rafPending) return;
  _stratoState.rafPending = true;
  requestAnimationFrame(() => {
    _stratoState.rafPending = false;
    try { _stratoUpdate(); } catch (e) {
      console.error('strato update error', e);
    }
    // ジェスチャー中も center-marker を地図中心へ追従させる。
    // _updateCenterOverlay は軽量 (setAttribute 数回) なので毎フレ呼んでも問題ない。
    try {
      if (typeof _updateCenterOverlay === 'function') _updateCenterOverlay();
    } catch (e) {
      console.error('center-overlay update from strato error', e);
    }
  });
}

// 外部制御 API
window.setStratoEnabled = function (on) {
  _stratoState.enabled = !!on;
  _scheduleStratoLive();
};
window.setStratoThickness = function (ratio) {
  const r = Number(ratio);
  if (isFinite(r) && r >= 0) _stratoState.thicknessRatio = r;
  _scheduleStratoLive();
};

// ===== [3] 地図中心の center-marker ========================================
//
//  - center-marker: 「現在地」風の青ドット + 縁 + ぼかしオーラ (cos(pitch) で楕円化)
//
// move / zoom / pitch / rotate / resize イベントで毎回 setAttribute を打って更新
// (rAF coalescing なしの直接呼び出し、軽量)。z-index=3 (`#map` の上、`#globe-frame`
// の下)。

const CENTER_MARKER_RX = 10.0;
const CENTER_MARKER_GLOW_EXTRA = 4.0;

function _updateCenterOverlay() {
  try {
    if (typeof map === 'undefined' || !map) return;
    const cv = map.getCanvas();
    if (!cv) return;
    const w = cv.clientWidth;
    const h = cv.clientHeight;
    if (w <= 0 || h <= 0) return;

    const center = map.getCenter();
    if (!center) return;
    const sp = map.project([center.lng, center.lat]);
    if (!sp || !Number.isFinite(sp.x) || !Number.isFinite(sp.y)) return;
    const cx = sp.x;
    const cy = sp.y;

    const pitchDeg = map.getPitch() || 0;
    const pitchRad = pitchDeg * Math.PI / 180;
    const rawCos = Math.cos(pitchRad);

    // --- center-marker 更新 ---
    // 地面に貼り付いた flat disc をカメラが pitch だけ傾けて見たときの正射影 =
    // ry = rx × cos(pitch)。pitch=0 → 正円、pitch=85 → 薄帯。
    const markerScaleY = rawCos < 0.06 ? 0.06 : rawCos;
    const ry = CENTER_MARKER_RX * markerScaleY;

    const marker = document.getElementById('center-marker');
    if (marker) {
      marker.setAttribute('cx', cx.toFixed(2));
      marker.setAttribute('cy', cy.toFixed(2));
      marker.setAttribute('rx', CENTER_MARKER_RX.toFixed(2));
      marker.setAttribute('ry', ry.toFixed(2));
    }
    const glow = document.getElementById('center-marker-glow');
    if (glow) {
      glow.setAttribute('cx', cx.toFixed(2));
      glow.setAttribute('cy', cy.toFixed(2));
      glow.setAttribute('rx', (CENTER_MARKER_RX + CENTER_MARKER_GLOW_EXTRA).toFixed(2));
      glow.setAttribute(
        'ry',
        (ry + CENTER_MARKER_GLOW_EXTRA * markerScaleY).toFixed(2),
      );
    }
  } catch (e) {
    console.error('updateCenterOverlay error', e);
  }
}

// ===== [4] ResizeObserver + map event wiring + style.load 初期化 ============
// 副作用集約: 他モジュールはここで初めて map に接続される。

// WebView リサイズ → MapLibre canvas リサイズ
const _ro = new ResizeObserver(() => {
  try {
    map.resize();
    try { _updateCenterOverlay(); } catch (_) {}
    recomputeDynamicZoomMin();
    enforceMinZoom();
    postProjections();
  } catch (_) {}
});
_ro.observe(document.getElementById('map'));

// self-heal を先に → 正常な状態を Flutter に通知
map.on('moveend', () => { selfHealMap(); postProjections(); });
map.on('zoomend', () => { selfHealMap(); postProjections(); });

// 大気リング (#strato-shadow) と地平線白線 (#globe-frame) は同じ円近似で更新する。
// strato が rAF coalesce で 1 フレ 1 回に間引きつつ追従する。
// measureHorizon 経路は撤去済み (旧 globe-overlay.js)。
map.on('move', _scheduleStratoLive);
map.on('zoom', _scheduleStratoLive);
map.on('pitch', _scheduleStratoLive);
map.on('rotate', _scheduleStratoLive);
map.on('resize', _scheduleStratoLive);

// 地図中心の center-marker (#center-overlay) を地図中心に追従させる。
// 計算は project 1 回 + measureSphereRadius 1 回 + setAttribute 10 回と軽量なので
// 毎イベント直接呼び出し。
map.on('move', _updateCenterOverlay);
map.on('zoom', _updateCenterOverlay);
map.on('pitch', _updateCenterOverlay);
map.on('rotate', _updateCenterOverlay);
map.on('resize', _updateCenterOverlay);

// 3D 建物 (fill-extrusion) を pitch 連動で toggle。pitch=0 → OFF、pitch>0 → ON。
map.on('pitch', () => {
  try {
    const p = map.getPitch();
    setExtrusionVisibility(p > 0.5); // 0.5deg 以下は実質 0 とみなす
  } catch (_) {}
});

map.on('style.load', () => {
  try {
    map.setProjection({ type: 'globe' });
  } catch (_) {}
  // 1) 初回 camera を確定: setProjection 直後に zoom / center / pitch / padding を
  //    一度書き込む。
  try {
    const padTop0 = (!_hasInitPadding && initPitch > 0)
      ? paddingTopForPitch(initPitch) : 0;
    map.jumpTo({
      center: [initLng, initLat],
      zoom: initZoom,
      pitch: initPitch,
      bearing: initBearing,
      padding: { top: padTop0, bottom: 0, left: 0, right: 0 },
    });
  } catch (e) {
    console.error('initial jumpTo error', e);
  }
  // 2) pitch 防衛: setProjection / 内部 resize 更新で MapLibre が pitch を 0 へ
  //    リセットするケースがある (WKWebView 初回レンダで顕著)。pitch のみ複数
  //    フレームに渡って enforce する。zoom / center は触らないため、Flutter
  //    onReady の `setCamera({zoom: 14, ...})` を上書きしない。
  const _enforcePitch = () => {
    try {
      const cur = map.getPitch();
      if (Math.abs(cur - initPitch) > 0.5) {
        const p = initPitch;
        map.jumpTo({
          pitch: p,
          padding: { top: paddingTopForPitch(p), bottom: 0, left: 0, right: 0 },
        });
        dlog('pitch-enforced', { wanted: p, was: cur, now: map.getPitch() });
      }
    } catch (e) {
      console.error('enforcePitch error', e);
    }
  };
  requestAnimationFrame(() => {
    _enforcePitch();
    requestAnimationFrame(_enforcePitch);
  });
  dlog('style-loaded', { version: EARTH_VERSION, zoom: map.getZoom(), pitch: map.getPitch() });

  // URL クエリで padding 指定があれば適用
  if (_hasInitPadding) {
    try {
      map.setPadding({
        top: initPadTop, bottom: initPadBottom,
        left: initPadLeft, right: initPadRight,
      });
      dlog('padding-applied', {
        top: initPadTop, bottom: initPadBottom,
        left: initPadLeft, right: initPadRight,
      });
    } catch (e) {
      console.error('setPadding error', e);
    }
  }

  try { shrinkPlaceLabels(8); } catch (e) { console.error('shrinkPlaceLabels error', e); }
  try { hideRoadShields(); } catch (e) { console.error('hideRoadShields error', e); }

  // 3D 建物 (fill-extrusion) は pitch 連動で ON/OFF。pitch=0 のとき真上から見るので 3D 描画は無駄。
  try {
    const _initPitchOn = (initPitch || 0) > 0;
    setExtrusionVisibility(_initPitchOn);
  } catch (e) { console.error('initial extrusion visibility error', e); }

  // 初期 pitch (URL クエリ等) に対しても padding.top 連動を適用
  if (!_hasInitPadding && initPitch > 0) {
    try {
      map.setPadding({
        top: paddingTopForPitch(initPitch),
        bottom: 0, left: 0, right: 0,
      });
    } catch (e) { console.error('initial padding error', e); }
  }

  recomputeDynamicZoomMin();
  enforceMinZoom();
  postZoomRange();
  // 初期表示で成層圏リングを 1 度描く (ジェスチャー前)。
  try { _scheduleStratoLive(); } catch (e) {
    console.error('initial strato error', e);
  }
  // 地図中心の center-marker を style.load 直後に 1 度描く。
  try { _updateCenterOverlay(); } catch (e) {
    console.error('initial center-overlay error', e);
  }
  _sendToHost(JSON.stringify({ type: 'ready' }));

  // Stagedeck 用: ?pinCount=N で seed 付き擬似 pin を描画
  if (initPinCount > 0 && initPinSeed !== '') {
    _spawnSeedPins(initPinSeed, initPinCount, initLat, initLng);
  }

  postProjections();
});
