/* ============================================================================
   earth/objects3d.js — SCREEN-SPACE 3D overlay for the UniverseView globe.

   なぜ別実装か:
   models.js は MapLibre の custom layer 内で「実寸(m)」で 3D を描くため、地図の
   ズームに比例して 3D も拡大縮小する（地表に張り付く）。本モジュールは要件
   「ズームしても 3D は常に一定の大きさ」「タップでフォーカス→中央表示→360°回覧」
   を満たすため、地図の上に独立した three.js キャンバスを重ね、毎フレーム各投稿の
   lat/lng を map.project() で画面ピクセルに射影し、その位置に *固定ピクセルサイズ* で
   3D を描く（地図は位置の供給源としてのみ使う）。

   公開 API:
     window.Objects3D.init({ getMap, container, models:[{id,lat,lng,url}], ... })
   ========================================================================== */
(function () {
  const D2R = Math.PI / 180;

  const cfg = {
    FOV: 38,
    DIST: 900,          // camera → object plane (world units, constant)
    MARKER_PX: 96,      // 画面上の 3D マーカー高さ(px)。ズーム非依存で一定。
    FOCUS_FRAC: 0.62,   // フォーカス時の高さ = min(w,h) * これ
    FACE_DEG: -90,      // 基準ヤウ：GLB 既定は右(+X)向き → -90°でカメラ(手前)向き
    JITTER_DEG: 26,     // 投稿ごとの向き揺らぎ
    IDLE_SPIN: 0.0,     // マーカーの自動回転(rad/フレーム)。0=静止
    CULL_MARGIN: 140,   // 画面外カリングの余白(px)
    MAIN_SCALE: 2.0,    // 画面中心に最も近い「メイン」マーカーの拡大率
    MAIN_LERP: 0.16,    // メイン拡大/縮小の補間速度（ポップ防止）
  };

  let map, container, renderer, scene, camera;
  let MeshoptReady = null;
  const loader = new THREE.GLTFLoader();
  const entries = new Map();      // id -> { lat,lng,url,group,faceY,onScreen,worldH }
  let running = false;

  // focus state
  let focusId = null;
  let focusT = 0;                 // 0..1 progress
  let focusDir = 0;               // +1 entering, -1 leaving
  let _mainId = null;             // id of the current center-nearest "main" marker
  const ZERO = new THREE.Vector3();

  // pointer / orbit
  let orbiting = false, lastX = 0, lastY = 0, didDrag = false;
  let spinY = 0, spinX = 0, velY = 0;       // orbit angles + inertia

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  // ----- focus chrome ------------------------------------------------------
  // z-order inside .screen: map(1) < scrim-dim(5) < 3D canvas(6) < chrome(9)
  let scrimEl, chromeEl, closeEl, hintEl;
  function buildChrome() {
    scrimEl = document.createElement('div');
    scrimEl.className = 'o3d-scrim';      // dim only — pointer-events:none always
    container.appendChild(scrimEl);

    chromeEl = document.createElement('div');
    chromeEl.className = 'o3d-chrome';
    chromeEl.innerHTML =
      '<button class="o3d-close" aria-label="閉じる">' +
        '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 3l10 10M13 3L3 13" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>' +
      '</button>' +
      '<div class="o3d-hint">ドラッグで360°回転 · タップで閉じる</div>';
    container.appendChild(chromeEl);
    closeEl = chromeEl.querySelector('.o3d-close');
    hintEl = chromeEl.querySelector('.o3d-hint');
    closeEl.addEventListener('click', (e) => { e.stopPropagation(); exitFocus(); });
  }

  function size() { return { w: container.clientWidth, h: container.clientHeight }; }
  function halfH() { return Math.tan((cfg.FOV / 2) * D2R) * cfg.DIST; }
  function pxToWorld() { return (2 * halfH()) / size().h; }

  // place a screen pixel (sx,sy) onto the object plane (z = -DIST)
  function screenToPlane(sx, sy) {
    const { w, h } = size();
    const hH = halfH(), hW = hH * (w / h);
    const nx = (sx / w) * 2 - 1;
    const ny = -((sy / h) * 2 - 1);
    return { x: nx * hW, y: ny * hH };
  }

  function init(opts) {
    map = opts.getMap();
    container = opts.container;
    Object.assign(cfg, opts.cfg || {});
    MeshoptReady = (window.MeshoptDecoder && MeshoptDecoder.ready) ? MeshoptDecoder.ready : null;
    if (window.MeshoptDecoder) loader.setMeshoptDecoder(MeshoptDecoder);

    const { w, h } = size();
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    const cv = renderer.domElement;
    cv.className = 'o3d-canvas';
    cv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:6;pointer-events:none;';
    container.appendChild(cv);

    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 1.05));
    const key = new THREE.DirectionalLight(0xffffff, 0.85); key.position.set(0.5, 0.9, 1.2); scene.add(key);
    const rim = new THREE.DirectionalLight(0xbcd0ff, 0.35); rim.position.set(-0.6, 0.2, -1); scene.add(rim);

    camera = new THREE.PerspectiveCamera(cfg.FOV, w / h, 1, 6000);
    camera.position.set(0, 0, 0);                 // looks down -Z by default

    buildChrome();
    buildEdgeLayer();

    map.on('click', onMapClick);
    cv.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('resize', onResize);

    (opts.models || []).forEach((m, i) => addModel(m, i));
    setupEdgePanel();
    start();
  }

  function addModel(m, i) {
    if (!m || !m.id || !m.url || typeof m.lat !== 'number' || typeof m.lng !== 'number') return;
    const faceY = (cfg.FACE_DEG + (((i * 47) % (cfg.JITTER_DEG * 2)) - cfg.JITTER_DEG)) * D2R;
    const entry = { id: m.id, lat: m.lat, lng: m.lng, url: m.url, group: null, faceY, onScreen: false, worldH: 1, spin: 0, mainK: 0 };
    entries.set(m.id, entry);

    const doLoad = () => loader.load(m.url, (gltf) => {
      const model = gltf.scene;
      // normalize: fit a UNIT CUBE by max dimension, center at origin.
      // (height-based normalize blows up reclining poses — these GLBs vary in orientation.)
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const sz = new THREE.Vector3(); box.getSize(sz);
      const ctr = new THREE.Vector3(); box.getCenter(ctr);
      const maxDim = Math.max(sz.x, sz.y, sz.z) || 1;
      const s0 = 1 / maxDim;
      entry._sz = [sz.x, sz.y, sz.z];
      entry.hRatio = sz.y / maxDim;     // normalized height (for resting on the point)
      model.scale.setScalar(s0);
      model.position.set(-ctr.x * s0, -ctr.y * s0, -ctr.z * s0);   // center at origin
      model.traverse((o) => {
        if (!o.material) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((mm) => { if (mm) { mm.depthTest = true; mm.depthWrite = true; } });
      });
      // capture a tiny portrait of THIS object for its edge-indicator chip.
      entry.thumb = captureThumb(model);
      const c0 = edgeChips.get(m.id);
      if (c0 && c0.img && entry.thumb) c0.img.src = entry.thumb;
      const g = new THREE.Group();
      g.add(model);

      // invisible HIT PROXY — a box covering the model's normalized footprint
      // (with a min size so thin/reclining poses stay tappable). Raycasting the
      // real triangle mesh of a tiny 96px marker misses constantly on slim
      // silhouettes → some objects felt "untappable". The proxy makes the whole
      // marker footprint a reliable tap target. (visible:false material still
      // raycasts in three; the renderer just never draws it.)
      const hx = Math.max(sz.x * s0, 0.7);
      const hy = Math.max(sz.y * s0, 0.7);
      const hz = Math.max(sz.z * s0, 0.7);
      const hit = new THREE.Mesh(
        new THREE.BoxGeometry(hx, hy, hz),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hit.position.set(0, 0, 0);
      hit.userData.id = m.id;        // entryFromObject resolves directly
      hit.userData.isHitProxy = true;
      g.add(hit);
      entry.hit = hit;

      g.userData.id = m.id;
      g.rotation.y = faceY;
      g.visible = false;
      scene.add(g);
      entry.group = g;
    }, undefined, (err) => console.warn('objects3d load error', m.id, err));

    if (MeshoptReady) MeshoptReady.then(doLoad); else doLoad();
  }

  // ----- per-frame layout + render ------------------------------------------
  function layout() {
    const { w, h } = size();
    const markerWorld = cfg.MARKER_PX * pxToWorld();
    const focusWorld = Math.min(w, h) * cfg.FOCUS_FRAC * pxToWorld();
    const ease = focusDir > 0 ? easeOutCubic(focusT) : (1 - easeOutCubic(1 - focusT));

    // ----- pick the on-screen marker nearest screen-center as the MAIN one ----
    // (recomputed every frame so the main object follows pan/rotate). The chosen
    // marker renders at MAIN_SCALE×; selection is suspended while a focus is open.
    const cx = w / 2, cy = h / 2;
    let mainId = null, mainBest = Infinity;
    if (!focusId) {
      entries.forEach((en) => {
        if (!en.group) return;
        const p = map.project([en.lng, en.lat]);
        if (p.x < -cfg.CULL_MARGIN || p.x > w + cfg.CULL_MARGIN ||
            p.y < -cfg.CULL_MARGIN || p.y > h + cfg.CULL_MARGIN) return;
        const d = (p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy);
        if (d < mainBest) { mainBest = d; mainId = en.id; }
      });
    }
    _mainId = mainId;

    entries.forEach((en) => {
      const g = en.group; if (!g) return;
      const isFocus = en.id === focusId;

      // smooth grow/shrink toward the main-object scale (no pop while panning)
      const mainTarget = (!focusId && en.id === mainId) ? 1 : 0;
      en.mainK += (mainTarget - en.mainK) * cfg.MAIN_LERP;
      if (en.mainK < 0.001) en.mainK = 0;
      const markerScaled = markerWorld * (1 + en.mainK * (cfg.MAIN_SCALE - 1));

      if (isFocus) {
        // animate from marker transform → centered focus transform
        const p = map.project([en.lng, en.lat]);
        const mk = screenToPlane(p.x, p.y);
        const wH = lerp(markerScaled, focusWorld, ease);
        const lift = 0.5 * markerScaled * (en.hRatio || 1);   // marker rests on the point
        g.scale.setScalar(wH);
        g.position.set(lerp(mk.x, 0, ease), lerp(mk.y + lift, 0, ease), -cfg.DIST);
        g.rotation.y = en.faceY + spinY;
        g.rotation.x = spinX;
        g.visible = true;
        g.renderOrder = 10;
      } else {
        // normal marker: constant px size at projected screen point
        const p = map.project([en.lng, en.lat]);
        const onScreen = p.x > -cfg.CULL_MARGIN && p.x < w + cfg.CULL_MARGIN &&
                         p.y > -cfg.CULL_MARGIN && p.y < h + cfg.CULL_MARGIN;
        // dim/hide others while a focus is active
        const hidden = focusId && ease > 0.04;
        g.visible = onScreen && !hidden;
        if (g.visible) {
          const mk = screenToPlane(p.x, p.y);
          const lift = 0.5 * markerScaled * (en.hRatio || 1);
          g.scale.setScalar(markerScaled);
          g.position.set(mk.x, mk.y + lift, -cfg.DIST);
          if (cfg.IDLE_SPIN) en.spin += cfg.IDLE_SPIN;
          g.rotation.set(0, en.faceY + en.spin, 0);
          g.renderOrder = en.mainK > 0.5 ? 2 : 1;   // main draws above neighbours
        }
      }
    });
  }

  function step() {
    // focus progress
    if (focusDir > 0 && focusT < 1) focusT = Math.min(1, focusT + 0.06);
    if (focusDir < 0 && focusT > 0) {
      focusT = Math.max(0, focusT - 0.06);
      if (focusT === 0) {
        focusId = null; focusDir = 0;
        if (container) container.classList.remove('o3d-focus-active');
      }
    }
    // orbit inertia
    if (!orbiting && Math.abs(velY) > 0.0002) { spinY += velY; velY *= 0.94; }

    // scrim opacity + chrome visibility follow focus
    if (scrimEl) {
      const vis = focusId != null;
      const a = focusDir > 0 ? easeOutCubic(focusT) : (1 - easeOutCubic(1 - focusT));
      scrimEl.style.opacity = vis ? a : 0;
      chromeEl.style.opacity = vis ? a : 0;
      // Keep the chrome CONTAINER click-through — otherwise its full-screen
      // inset:0 box (z-index 58) swallows every drag before it reaches the 3D
      // canvas (z-index 57) underneath, killing 360° orbit. The close button
      // re-enables pointer-events on itself in CSS, so it still works.
      chromeEl.style.pointerEvents = 'none';
      if (renderer) {
        renderer.domElement.style.pointerEvents = (vis && focusT > 0.2) ? 'auto' : 'none';
        renderer.domElement.style.zIndex = (vis && focusT > 0.001) ? 57 : 6;
      }
      // 閉じるボタンは「フォーカス中オブジェクトの左上」に置く（画面端ではなく）。
      // half は拡大アニメ(a)に追従、画面端からは余白を取ってクランプ。
      if (vis && closeEl) {
        const { w, h } = size();
        const half = (Math.min(w, h) * cfg.FOCUS_FRAC / 2) * a;
        const cx = w / 2, cy = h / 2;
        const btn = closeEl.offsetWidth || 40;
        let bx = cx - half - 6, by = cy - half - 6;
        bx = Math.max(bx, btn / 2 + 14);         // 左端から離す
        by = Math.max(by, 60 + btn / 2);         // 上端(ステータスバー)から離す
        closeEl.style.right = 'auto';
        closeEl.style.left = (bx - btn / 2) + 'px';
        closeEl.style.top = (by - btn / 2) + 'px';
      }
    }

    layout();
    updateEdges();
    renderer.render(scene, camera);
  }

  function frame() { if (!running) return; step(); requestAnimationFrame(frame); }

  function start() { if (!running) { running = true; requestAnimationFrame(frame); } }

  // ----- interaction --------------------------------------------------------
  function entryFromObject(obj) {
    let o = obj;
    while (o) { if (o.userData && o.userData.id) return entries.get(o.userData.id); o = o.parent; }
    return null;
  }

  function onMapClick(e) {
    if (focusId) return;
    const { w, h } = size();
    ndc.x = (e.point.x / w) * 2 - 1;
    ndc.y = -((e.point.y / h) * 2 - 1);
    raycaster.setFromCamera(ndc, camera);
    const objs = [];
    entries.forEach((en) => { if (en.group && en.group.visible) objs.push(en.group); });
    const hits = raycaster.intersectObjects(objs, true);
    if (hits.length) {
      const en = entryFromObject(hits[0].object);
      if (!en) return;
      // メインのオブジェクト（画面中心に最も近い＝拡大表示中）をタップ → フォーカス。
      // それ以外をタップ → フォーカスせず、地図をその位置へ移動（＝そのオブジェクトが
      // 中心＝新しいメインになる）。
      if (en.id === _mainId) enterFocus(en.id);
      else panToEntry(en);
    }
  }

  function panToEntry(en) {
    if (!en) return;
    map.easeTo({
      center: [en.lng, en.lat],
      duration: 650,
      easing: easeOutCubic,
    });
  }

  function enterFocus(id) {
    focusId = id; focusDir = 1; focusT = 0;
    spinY = 0; spinX = 0; velY = 0;
    setMapInteractive(false);
    // raise the app chrome above the focused object so the list/buttons stay
    // tappable and a tap on them never dismisses the focus (see CSS).
    if (container) container.classList.add('o3d-focus-active');
  }
  function exitFocus() {
    if (focusId == null) return;
    focusDir = -1;
    setMapInteractive(true);
  }

  function setMapInteractive(on) {
    const fns = ['dragPan', 'scrollZoom', 'boxZoom', 'doubleClickZoom', 'touchZoomRotate', 'keyboard'];
    fns.forEach((k) => { if (map[k]) (on ? map[k].enable() : map[k].disable()); });
  }

  function onDown(e) {
    if (focusId == null || focusT < 0.5) return;
    orbiting = true; didDrag = false; lastX = e.clientX; lastY = e.clientY; velY = 0;
    try { renderer.domElement.setPointerCapture(e.pointerId); } catch (_) {}
  }
  function onMove(e) {
    if (!orbiting) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    if (Math.abs(dx) + Math.abs(dy) > 2) didDrag = true;
    spinY += dx * 0.012; velY = dx * 0.012;
    spinX = clamp(spinX + dy * 0.010, -0.7, 0.7);
    if (hintEl) hintEl.style.opacity = 0;
  }
  function onUp() {
    if (orbiting && focusId != null && !didDrag) exitFocus();   // tap (no drag) on canvas → close
    orbiting = false;
  }

  function onResize() {
    if (!renderer) return;
    const { w, h } = size();
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  // ----- helpers ------------------------------------------------------------
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  // ==========================================================================
  // 周辺オブジェクト指標 — off-screen neighbour indicators clamped to the edge
  // 画面内に表示中のオブジェクトが少ない（既定: 1個以下）時、画面外にある近隣
  // オブジェクトを、その方向(矢印)・距離つきで縁に提示し『一個だけで寂しい』を解消。
  // 各チップの中身は対象 3D の実ポートレート(captureThumb)。タップでそこへパン。
  // ==========================================================================
  const EDGE_LS = 'toopdbq.edgeInd.v2';
  const EDGE_DEFAULTS = {
    enabled: true,
    style: 'portrait',   // portrait | arrow | dot
    size: 40,            // chip diameter (px)
    showDistance: true,
    pulse: true,
    maxCount: 8,
    sparseMax: 2,        // 画面内の「別々の」オブジェクトが これ以下 の時だけ出す（99 = 常時）
  };
  // 画面の淵ギリギリまで寄せる：ディスク外縁が画面端を少しはみ出す（poke）所まで。
  // 端で重なる実 3D マーカー / app chrome（オーバーレイ）の下の層に潜る（CSS .o3d-edge=4）。
  const EDGE_TOP_SAFE = 60;   // 上端だけはステータスバーの直下に覗くよう、これ以上は上げない
  let EDGE = loadEdge();
  let edgeEl = null;
  const edgeChips = new Map();   // id -> { el, img, arrow, dist }

  // tiny offscreen renderer — each loaded GLB → a portrait dataURL (the chip icon)
  let thumbR = null, thumbScene = null, thumbCam = null;
  const THUMB_PX = 132;

  function loadEdge() {
    try { return Object.assign({}, EDGE_DEFAULTS, JSON.parse(localStorage.getItem(EDGE_LS) || '{}')); }
    catch (e) { return Object.assign({}, EDGE_DEFAULTS); }
  }
  function saveEdge() { try { localStorage.setItem(EDGE_LS, JSON.stringify(EDGE)); } catch (e) {} }

  function ensureThumbR() {
    if (thumbR) return;
    thumbR = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    thumbR.setPixelRatio(2);
    thumbR.setSize(THUMB_PX, THUMB_PX, false);
    thumbScene = new THREE.Scene();
    thumbScene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const k = new THREE.DirectionalLight(0xffffff, 0.95); k.position.set(0.45, 0.9, 1.1); thumbScene.add(k);
    const r = new THREE.DirectionalLight(0xbcd0ff, 0.4); r.position.set(-0.6, 0.2, -1); thumbScene.add(r);
    thumbCam = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
    thumbCam.position.set(0, 0.12, 2.25);
    thumbCam.lookAt(0, 0, 0);
  }
  // render the normalized model (unit cube, centered at origin) to a dataURL.
  function captureThumb(model) {
    try {
      ensureThumbR();
      const holder = new THREE.Group();
      holder.add(model);              // borrow the model briefly
      holder.rotation.set(0, -0.5, 0);
      thumbScene.add(holder);
      thumbR.render(thumbScene, thumbCam);
      const url = thumbR.domElement.toDataURL('image/png');
      thumbScene.remove(holder);
      holder.remove(model);           // return it to the caller (→ g.add(model))
      return url;
    } catch (e) { return null; }
  }

  function applyEdge() {
    if (edgeEl) {
      edgeEl.className = 'o3d-edge o3d-edge--' + EDGE.style +
        (EDGE.pulse ? ' o3d-edge--pulse' : '') +
        (EDGE.showDistance ? '' : ' o3d-edge--nodist');
      edgeEl.style.setProperty('--ei-size', EDGE.size + 'px');
    }
    saveEdge();
  }
  function buildEdgeLayer() {
    edgeEl = document.createElement('div');
    container.appendChild(edgeEl);
    applyEdge();
  }
  function ensureChip(en) {
    let c = edgeChips.get(en.id);
    if (c) return c;
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'o3d-edge-chip';
    el.innerHTML = '<span class="disc"><img alt=""></span><span class="arrow"></span><span class="dist"></span>';
    if (en.thumb) el.querySelector('img').src = en.thumb;
    el.addEventListener('click', (e) => { e.stopPropagation(); panToEntry(en); });
    edgeEl.appendChild(el);
    c = { el, img: el.querySelector('img'), arrow: el.querySelector('.arrow'), dist: el.querySelector('.dist') };
    edgeChips.set(en.id, c);
    return c;
  }

  // map a border point → perimeter scalar s (and back) for overlap declutter.
  function perimS(x, y, rc) {
    const W = rc.r - rc.l, H = rc.b - rc.t;
    if (Math.abs(y - rc.t) < 0.6) return (x - rc.l);
    if (Math.abs(x - rc.r) < 0.6) return W + (y - rc.t);
    if (Math.abs(y - rc.b) < 0.6) return W + H + (rc.r - x);
    return 2 * W + H + (rc.b - y);
  }
  function sToXY(s, rc) {
    const W = rc.r - rc.l, H = rc.b - rc.t;
    if (s <= W) return { x: rc.l + s, y: rc.t };
    s -= W; if (s <= H) return { x: rc.r, y: rc.t + s };
    s -= H; if (s <= W) return { x: rc.r - s, y: rc.b };
    s -= W; return { x: rc.l, y: rc.b - s };
  }
  function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371000, toR = Math.PI / 180;
    const dLat = (lat2 - lat1) * toR, dLng = (lng2 - lng1) * toR;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * toR) * Math.cos(lat2 * toR) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }
  function fmtDist(m) {
    if (m >= 1000) return (m / 1000).toFixed(1) + '<i>km</i>';
    return Math.round(m) + '<i>m</i>';
  }

  function updateEdges() {
    if (!edgeEl) return;
    if (!EDGE.enabled || focusId) { edgeEl.style.display = 'none'; return; }
    edgeEl.style.display = 'block';
    const { w, h } = size();
    // 淵ギリギリ：ディスク中心を画面端から (radius - poke) に置く → 外縁が poke px はみ出す。
    const radius = EDGE.size / 2;
    const poke = EDGE.style === 'arrow' ? 0 : 8;
    const sideIn = radius - poke;
    const rc = { l: sideIn, t: Math.max(radius - poke, EDGE_TOP_SAFE), r: w - sideIn, b: h - sideIn };
    const ocx = (rc.l + rc.r) / 2, ocy = (rc.t + rc.b) / 2;
    const ctr = map.getCenter();

    const off = []; const insidePts = [];
    entries.forEach((en) => {
      if (!en.group) return;
      const p = map.project([en.lng, en.lat]);
      if (p.x >= rc.l && p.x <= rc.r && p.y >= rc.t && p.y <= rc.b) { insidePts.push(p); hideChip(en.id); return; }
      off.push({ en, p, dm: haversine(ctr.lat, ctr.lng, en.lat, en.lng) });
    });

    // 出現条件: 画面内の「別々の」オブジェクト数が多い時は出さない。
    // 同一スポットに重なる複数は 1 と数える（ハチ公像の山を 1 個扱い）。
    if (clusterCount(insidePts, cfg.MARKER_PX * 0.8) > EDGE.sparseMax) {
      edgeChips.forEach((c) => c.el.classList.remove('on')); return;
    }

    off.sort((a, b) => a.dm - b.dm);
    const shown = off.slice(0, EDGE.maxCount);
    const ids = new Set(shown.map((s) => s.en.id));
    edgeChips.forEach((c, id) => { if (!ids.has(id)) c.el.classList.remove('on'); });

    const perim = 2 * ((rc.r - rc.l) + (rc.b - rc.t));
    const placed = shown.map(({ en, p, dm }) => {
      const dx = p.x - ocx, dy = p.y - ocy;
      const tx = dx > 0 ? (rc.r - ocx) / dx : dx < 0 ? (rc.l - ocx) / dx : Infinity;
      const ty = dy > 0 ? (rc.b - ocy) / dy : dy < 0 ? (rc.t - ocy) / dy : Infinity;
      const t = Math.min(tx, ty);
      const x = ocx + dx * t, y = ocy + dy * t;
      return { en, dm, bearing: Math.atan2(dy, dx), s: perimS(x, y, rc) };
    });
    // declutter: spread overlapping chips along the perimeter (arrows keep true bearing)
    placed.sort((a, b) => a.s - b.s);
    const gap = EDGE.size * 1.06;
    for (let i = 1; i < placed.length; i++) {
      if (placed[i].s - placed[i - 1].s < gap) placed[i].s = placed[i - 1].s + gap;
    }
    const push = EDGE.style === 'arrow' ? 0 : EDGE.style === 'dot' ? 11 : (EDGE.size * 0.5 + 7);
    placed.forEach((pl) => {
      const xy = sToXY(((pl.s % perim) + perim) % perim, rc);
      const c = ensureChip(pl.en);
      c.el.style.transform = `translate(${xy.x}px,${xy.y}px) translate(-50%,-50%)`;
      // どの淵に着いたか → 距離ラベルを内側に逃がし、ディスクが端をはみ出しても読める様に。
      let edge = 'l';
      if (Math.abs(xy.y - rc.t) < 0.6) edge = 't';
      else if (Math.abs(xy.x - rc.r) < 0.6) edge = 'r';
      else if (Math.abs(xy.y - rc.b) < 0.6) edge = 'b';
      c.el.classList.remove('edge-l', 'edge-r', 'edge-t', 'edge-b');
      c.el.classList.add('edge-' + edge);
      if (poke > 0) { c.arrow.style.display = 'none'; }   // ディスクが淵に乗る → 位置そのものが方向の手がかり
      else { c.arrow.style.display = ''; c.arrow.style.transform = `translate(-50%,-50%) rotate(${pl.bearing}rad) translateX(${push}px)`; }
      if (EDGE.showDistance) c.dist.innerHTML = fmtDist(pl.dm);
      if (c.img && pl.en.thumb && c.img.getAttribute('src') !== pl.en.thumb) c.img.src = pl.en.thumb;
      c.el.classList.add('on');
    });
  }
  function hideChip(id) { const c = edgeChips.get(id); if (c) c.el.classList.remove('on'); }

  // count DISTINCT on-screen spots: merge points closer than r px into one.
  function clusterCount(pts, r) {
    const used = new Array(pts.length).fill(false);
    let n = 0;
    for (let i = 0; i < pts.length; i++) {
      if (used[i]) continue;
      used[i] = true; n++;
      for (let j = i + 1; j < pts.length; j++) {
        if (used[j]) continue;
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        if (dx * dx + dy * dy < r * r) used[j] = true;
      }
    }
    return n;
  }

  // ----- tuning-panel group (the "施策" surface: explore styles live) --------
  function _seg(label, opts, getVal, onPick) {
    const wrap = document.createElement('div'); wrap.className = 'ctrl';
    if (label) { const lab = document.createElement('div'); lab.className = 'lab'; lab.innerHTML = `<span>${label}</span>`; wrap.appendChild(lab); }
    const seg = document.createElement('div'); seg.className = 'seg';
    opts.forEach((o) => {
      const b = document.createElement('button'); b.textContent = o.label;
      if (String(getVal()) === String(o.id)) b.classList.add('sel');
      b.onclick = () => { onPick(o.id); seg.querySelectorAll('button').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); };
      seg.appendChild(b);
    });
    wrap.appendChild(seg); return wrap;
  }
  function _range(label, key, min, max, step, unit) {
    const wrap = document.createElement('div'); wrap.className = 'ctrl';
    const lab = document.createElement('div'); lab.className = 'lab';
    const val = document.createElement('b'); val.textContent = EDGE[key] + (unit || '');
    lab.innerHTML = `<span>${label}</span>`; lab.appendChild(val);
    const inp = document.createElement('input');
    inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step; inp.value = EDGE[key];
    inp.oninput = () => { const v = parseFloat(inp.value); val.textContent = v + (unit || ''); EDGE[key] = v; applyEdge(); };
    wrap.appendChild(lab); wrap.appendChild(inp); return wrap;
  }
  function buildEdgePanel() {
    const body = document.getElementById('panelBody');
    if (!body) return;
    const old = body.querySelector('#edge-group'); if (old) old.remove();
    const g = document.createElement('div'); g.className = 'group'; g.id = 'edge-group';
    const gt = document.createElement('div'); gt.className = 'gt';
    gt.innerHTML = '周辺オブジェクト指標 <span class="id">objects3d.js</span>';
    g.appendChild(gt);
    g.appendChild(_seg('スタイル', [
      { id: 'portrait', label: 'サムネ' }, { id: 'arrow', label: '矢印' },
      { id: 'dot', label: 'ドット' }, { id: 'off', label: 'オフ' },
    ], () => EDGE.enabled ? EDGE.style : 'off', (v) => {
      if (v === 'off') EDGE.enabled = false; else { EDGE.enabled = true; EDGE.style = v; }
      applyEdge();
    }));
    g.appendChild(_range('サイズ', 'size', 28, 56, 1, 'px'));
    g.appendChild(_seg('出現条件', [
      { id: 1, label: '1個の時' }, { id: 2, label: '2個まで' }, { id: 99, label: '常に' },
    ], () => EDGE.sparseMax, (v) => { EDGE.sparseMax = +v; saveEdge(); }));
    g.appendChild(_seg('距離ラベル', [{ id: 1, label: '表示' }, { id: 0, label: 'なし' }],
      () => EDGE.showDistance ? 1 : 0, (v) => { EDGE.showDistance = !!+v; applyEdge(); }));
    g.appendChild(_seg('パルス', [{ id: 1, label: 'ON' }, { id: 0, label: 'OFF' }],
      () => EDGE.pulse ? 1 : 0, (v) => { EDGE.pulse = !!+v; applyEdge(); }));
    g.appendChild(_range('最大表示数', 'maxCount', 3, 11, 1, ''));
    body.insertBefore(g, body.firstChild);
  }
  function setupEdgePanel() {
    buildEdgePanel();
    if (window.EarthLook && !window.EarthLook._edgePatched) {
      const orig = window.EarthLook.buildPanel;
      window.EarthLook.buildPanel = function () { orig.apply(this, arguments); buildEdgePanel(); };
      window.EarthLook._edgePatched = true;
    }
  }

  window.Objects3D = {
    init,
    focus: enterFocus,
    exitFocus,
    get focused() { return focusId; },
    get main() { return _mainId; },
    edge: { get cfg() { return EDGE; }, refresh() { applyEdge(); } },
    _tick() { step(); },
    cfg,
    debug() {
      const o = []; entries.forEach((e) => o.push({ id: e.id, sz: e._sz, loaded: !!e.group, vis: e.group && e.group.visible, scale: e.group && e.group.scale.x }));
      return { markerWorld: cfg.MARKER_PX * pxToWorld(), pxToWorld: pxToWorld(), halfH: halfH(), entries: o };
    },
  };
})();
