/* ============================================================================
   earth/objects3d.js — SCREEN-SPACE 3D overlay for the UniverseView globe.

   なぜ別実装か:
   models.js は MapLibre の custom layer 内で「実寸(m)」で 3D を描くため、地図の
   ズームに比例して 3D も拡大縮小する（地表に張り付く）。本モジュールは要件
   「ズームしても 3D は常に一定の大きさ」「タップでフォーカス→中央表示→360°回覧」
   を満たすため、地図の上に独立した three.js キャンバスを重ね、毎フレーム各投稿の
   lat/lng を map.project() で画面ピクセルに射影し、その位置に *固定ピクセルサイズ* で
   3D を描く（地図は位置の供給源としてのみ使う）。

   連携モデル（実機準拠・このモジュールが調整役）:
     1 投稿 = 1 エンティティ {id,lat,lng,circleId,glbUrl,thumbUrl}。3D は glbUrl を、
     リールは thumbUrl を *同じ id* で引く。ピンをタイル cell で bin し、画面中心に
     最も近い cell を「メインクラスタ」に。そのクラスタ内で中心に最も近い 1 投稿を
     代表(repId)とし、地図の巨大 main / リール白枠 / フォーカス対象 を *すべて同じ
     repId* に揃える（単一の真実）。クラスタ/代表が変わるたび onChange を発火し、
     リール側（Earth Globe.html）が行を組み替え・白枠を移す。

   公開 API:
     window.Objects3D.init({ getMap, container, models:[{id,lat,lng,url}], ... })
     window.Objects3D.onChange(cb)              // ({repId, clusterKey, ids}, rebuild)
     window.Objects3D.selectRepresentative(id, {glide, lock})
     window.Objects3D.focus(id) / .exitFocus()
     window.Objects3D.thumbFor(id)              // 実 GLB から焼いたポートレート dataURL
   ========================================================================== */
(function () {
  const D2R = Math.PI / 180;

  const cfg = {
    FOV: 38,
    DIST: 900,          // camera → object plane (world units, constant)
    MARKER_PX: 92,      // 画面上の 3D マーカー高さ(px)。ズーム非依存で一定。
    FOCUS_FRAC: 0.6,   // フォーカス時の高さ = min(w,h) * これ（実機 全画面寄り）
    FOCUS_STEP: 0.052,  // フォーカス進捗/フレーム → ≈320ms easeOutCubic
    FACE_DEG: -90,      // 基準ヤウ：GLB 既定は右(+X)向き → -90°でカメラ(手前)向き
    JITTER_DEG: 26,     // 投稿ごとの向き揺らぎ
    IDLE_SPIN: 0.0025,  // メインじゃないオブジェクトの自動回転(rad/フレーム)。代表(main)は静止。
    CULL_MARGIN: 140,   // 画面外カリングの余白(px)
    CENTER_Y_FRAC: 0.62,// 「中心」と見なす画面上の縦位置 = h × これ（下にずらすほど下寄り判定）
    MAIN_SCALE: 3.4,    // 代表(repId)マーカーの拡大率＝地図の「巨大 main」
    MAIN_LERP: 0.16,    // メイン拡大/縮小の補間速度（ポップ防止）
    FLOAT_FRAC: 0.22,   // マーカーを地点から浮かせる量＝marker高さ × これ（接地点の上に隙間）
    SHADOW_W: 0.60,     // 接地点の影の横幅＝marker高さ × これ
    SHADOW_H: 0.20,     // 〃 縦幅（楕円につぶす）
    SHADOW_OPACITY: 0.7,// 影の濃さ
    REP_LOCK_MS: 1500,  // 代表を手動選択した後、自動再選定を抑止する時間
    LONG_PRESS_MS: 420, // 長押し判定の閾値(ms)。これ以上で 3D フォーカス、未満のタップは写真フルスクリーン。
    PRESS_MOVE_TOL: 10, // 長押し/タップを無効化する移動量(px)。これ以上動かしたらドラッグ扱い。
    CLUSTER_PX: 76,     // ズーム連動クラスタ：投影ピクセル距離がこの値未満のピンを 1 クラスタに束ねる。
                        //  ズームアウト→ピンが近づく→併合 / ズームイン→離れる→分裂（単一リンク法）。
    CLUSTER_HYST: 1.35, // ヒステリシス：前フレームで同じクラスタだったペアは閾値を ×この値まで許容（境界での点滅防止）。
  };

  let map, container, renderer, scene, camera;
  let MeshoptReady = null;
  const loader = new THREE.GLTFLoader();
  const entries = new Map();      // id -> { lat,lng,url,group,faceY,onScreen,worldH }
  let running = false;

  // ----- 3D media totem: each post's looping video card, stacked under its 3D --
  let mediaEl = null;
  const mediaCards = new Map();   // id -> { el, node }

  // ----- non-main cluster reps: flat mini-thumbnail markers (no 3D) ----------
  let thumbEl = null;
  const thumbCards = new Map();   // id -> { el, img }

  // ----- focus-state dock: hidden cluster members shown bottom-left as an arc --
  let dockEl = null;
  let dockCapEl = null;
  const dockItems = new Map();    // id -> { el, img }
  // arc carousel state: a continuous scroll position (in member-index units).
  let dockScroll = 0, dockTarget = 0;
  let dockDragging = false, dockMoved = false, dockStartX = 0, dockStartScroll = 0;
  let dockSig = '';
  // ----- non-focus bottom carousel (scrollable horizontal row of 3D objects) --
  let carStripEl = null;
  let carScrimEl = null;
  let carPos = 0, carTarget = 0, carInit = false;
  let carClusterKey = null;          // which cluster the carousel currently represents
  const clusterSel = new Map();      // clusterKey -> 그 cluster で最後に選んだ代表 id（クラスタ別に記憶）
  let carDragging = false, carMoved = false, carStartX = 0, carStartPos = 0, carDownX = 0;
  // R=弧半径(px) STEP=隔角(rad) AX/AY=頂点位置(dock領域比) CULL=表示角幅上限
  const DOCK = { R: 210, STEP: 0.34, AX: 0.42, AY: 0.30, EASE: 0.2, CULL: 1.5 };

  // focus state
  let focusId = null;
  let focusT = 0;                 // 0..1 progress
  let focusDir = 0;               // +1 entering, -1 leaving
  const ZERO = new THREE.Vector3();

  // ----- single source of truth: representative + main cluster -------------
  // repId は「地図の巨大 main / リール白枠 / フォーカス対象」を貫く 1 本の id。
  // mainCluster は repId を含むタイル cell（画面中心に最も近い cell）の全 pin。
  let repId = null;               // current representative (the giant "main")
  let repLockUntil = 0;           // performance.now() — 手動選択後の自動再選定ロック
  let mainClusterKey = null;      // tile key of the current main cluster
  let mainClusterIds = [];        // ids of all pins in the main cluster
  let mapMarkerIds = [];          // ids drawn as on-map markers this frame (repId + each non-main cluster rep)
  let _mainId = null;             // backward-compat alias of repId (edge layer 等)
  const changeCbs = [];           // onChange subscribers
  const thumbCbs = [];            // onThumb subscribers (id, dataURL)
  const tapCbs = [];              // onTap subscribers (id) — 短いタップで発火（写真フルスクリーン用）
  const mediaTapCbs = [];        // onMediaTap subscribers (id, cardEl) — マッピングされた動画をタップ

  // press detection (long-press → focus / tap → onTap)
  let pressTimer = null, pressStart = null, pressMoved = false, pressEntry = null, longFired = false;

  // pointer / orbit
  let orbiting = false, lastX = 0, lastY = 0, didDrag = false;
  let spinY = 0, spinX = 0, velY = 0;       // orbit angles + inertia

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  // shared soft radial shadow texture (one canvas, reused by every object's ground shadow)
  let _shadowTex = null;
  function shadowTexture() {
    if (_shadowTex) return _shadowTex;
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.22, 'rgba(0,0,0,0.55)');
    g.addColorStop(0.6, 'rgba(0,0,0,0.18)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    _shadowTex = new THREE.CanvasTexture(c);
    return _shadowTex;
  }

  // ----- focus chrome ------------------------------------------------------
  // z-order inside .screen: map(1) < scrim-dim(5) < 3D canvas(6) < chrome(9)
  let scrimEl, chromeEl, closeEl, hintEl, focusBgEl, focusGradEl, playEl;
  function buildChrome() {

    // フォーカス背景グラデーション：デザインシステムのメイングラデーション（斜め方向）を
    // フルスクリーンで敷き、波打つようにアニメーション。ブラー背景の縁から色が滲み出る。
    focusGradEl = document.createElement('div');
    focusGradEl.className = 'o3d-focus-grad';
    focusGradEl.style.cssText =
      'position:absolute;inset:-15%;z-index:4;opacity:0;pointer-events:none;' +
      'transition:opacity .3s var(--ease-out);' +
      'background:' +
        'radial-gradient(55% 55% at 22% 28%, #fff0a6 0%, rgba(255,240,166,0) 60%),' +
        'radial-gradient(60% 60% at 80% 24%, #005f67 0%, rgba(0,95,103,0) 62%),' +
        'radial-gradient(60% 60% at 78% 80%, #ff3e88 0%, rgba(255,62,136,0) 60%),' +
        'radial-gradient(60% 60% at 18% 82%, #d0a052 0%, rgba(208,160,82,0) 62%),' +
        'linear-gradient(135deg, #fff0a6 0%, #005f67 38%, #ff3e88 70%, #d0a052 100%);' +
      'background-size:180% 180%,180% 180%,180% 180%,180% 180%,200% 200%;' +
      'filter:saturate(150%);' +
      'animation:o3dGradFlow 14s ease-in-out infinite;';
    container.appendChild(focusGradEl);

    // フォーカス背景：フォーカス中のオブジェクトのサムネイルをぼかして敷く（scrim の下）。
    focusBgEl = document.createElement('div');
    focusBgEl.className = 'o3d-focus-bg';
    focusBgEl.style.cssText = 'position:absolute;inset:0;z-index:5;background-size:cover;background-position:center;filter:blur(8px);transform:scale(1.0);opacity:0;transition:opacity .3s var(--ease-out);pointer-events:none;' +
      '-webkit-mask:radial-gradient(120% 120% at 50% 50%, #000 52%, rgba(0,0,0,0) 92%);' +
      'mask:radial-gradient(120% 120% at 50% 50%, #000 52%, rgba(0,0,0,0) 92%);';
    container.appendChild(focusBgEl);

    scrimEl = document.createElement('div');
    scrimEl.className = 'o3d-scrim';      // dim only — pointer-events:none always
    container.appendChild(scrimEl);

    chromeEl = document.createElement('div');
    chromeEl.className = 'o3d-chrome';
    chromeEl.innerHTML =
      '<button class="o3d-close" aria-label="閉じる">' +
        '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 3l10 10M13 3L3 13" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>' +
      '</button>';
    container.appendChild(chromeEl);
    closeEl = chromeEl.querySelector('.o3d-close');
    hintEl = null;
    closeEl.addEventListener('click', (e) => { e.stopPropagation(); exitFocus(); });

    // 再生ボタン：画面下部中央（ボトムから 50px 上）。タップで動画をフルスクリーン再生。
    playEl = document.createElement('button');
    playEl.className = 'o3d-play';
    playEl.setAttribute('aria-label', '再生');
    playEl.style.cssText = 'position:absolute;left:50%;bottom:50px;transform:translateX(-50%);width:64px;height:64px;border-radius:50%;border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;pointer-events:none;background:rgba(0,0,0,.42);backdrop-filter:blur(10px) saturate(150%);-webkit-backdrop-filter:blur(10px) saturate(150%);box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 6px 20px rgba(0,0,0,.5);';
    playEl.innerHTML = '<svg width="22" height="24" viewBox="0 0 22 24" style="margin-left:3px"><path d="M3 2.5v19l16-9.5z" fill="#fff"/></svg>';
    chromeEl.appendChild(playEl);
    playEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (focusId) mediaTapCbs.forEach((cb) => { try { cb(focusId, null); } catch (_) {} });
    });
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

  // 反転モード：代表を含むメインクラスタの全メンバーを、画面下に *横並びリスト* でドックする。
  function dockList() {
    return mainClusterIds.slice();   // 安定した並び（順序は変えない）
  }
  const CAR_PITCH = 104;             // カルーセルの中心間ピッチ(px)
  // index 番目を、carPos(現在の中央位置) を基準に左右へ並べる。中央のものは少し大きい。
  function dockSlot(index) {
    const { w, h } = size();
    const objHpx = 84;            // 各オブジェクトの画面サイズ（最大寸 px）
    const sx = w / 2 + (index - carPos) * CAR_PITCH;
    const sy = h - 104;
    return { sx, sy, objHpx };
  }

  // 下部カルーセル：ドラッグ/スワイプで横スクロール。中央に来たものが代表になり、
  // 地図の動画が切り替わる。中央以外をタップ → そこへスクロール。中央をタップ → フォーカス(360°)。
  function buildCarStrip() {
    carStripEl = document.createElement('div');
    carStripEl.className = 'o3d-carstrip';
    // 背景の透過グラデーションスクリムは別レイヤーで敷く（インタラクト領域は拡大しない）。
    // 上端透過→下端濃めで背後の地図を徐々に遮り、リストの視認性を上げる。pointer-events:none でタップは透す。
    carScrimEl = document.createElement('div');
    carScrimEl.className = 'o3d-carstrip-scrim';
    // z-index は 3D キャンバス(o3d-canvas=6)より下げる。こうすると地図(=1)は暗く沈むが、
    // クラスタの 3D リスト(キャンバス=6)とメディアカードはスクリムの上に乗って見える。
    carScrimEl.style.cssText = 'position:absolute;left:0;right:0;bottom:0;height:236px;z-index:5;pointer-events:none;' +
      'background:linear-gradient(to bottom, rgba(8,11,18,0) 0%, rgba(8,11,18,0.26) 30%, rgba(8,11,18,0.6) 60%, rgba(8,11,18,0.85) 100%);';
    container.appendChild(carScrimEl);
    carStripEl.style.cssText = 'position:absolute;left:0;right:0;bottom:0;height:172px;z-index:8;touch-action:none;cursor:grab;';
    container.appendChild(carStripEl);
    carStripEl.addEventListener('pointerdown', onCarDown);
    window.addEventListener('pointermove', onCarMove);
    window.addEventListener('pointerup', onCarUp);
  }
  function onCarDown(e) {
    const ids = dockList(); if (!ids.length) return;
    e.stopPropagation();
    carDragging = true; carMoved = false;
    carStartX = e.clientX; carStartPos = carPos;
    const rect = container.getBoundingClientRect();
    carDownX = e.clientX - rect.left;
    try { carStripEl.setPointerCapture(e.pointerId); } catch (_) {}
    carStripEl.style.cursor = 'grabbing';
  }
  function onCarMove(e) {
    if (!carDragging) return;
    const ids = dockList();
    const dx = e.clientX - carStartX;
    if (Math.abs(dx) > 6) carMoved = true;
    carPos = clamp(carStartPos - dx / CAR_PITCH, 0, Math.max(0, ids.length - 1));
  }
  function onCarUp() {
    if (!carDragging) return;
    carDragging = false;
    if (carStripEl) carStripEl.style.cursor = 'grab';
    const ids = dockList(); const n = ids.length; if (!n) return;
    if (carMoved) {
      carTarget = clamp(Math.round(carPos), 0, n - 1);          // snap → 中央が代表に
    } else {
      const { w } = size();
      const idx = clamp(Math.round(carPos + (carDownX - w / 2) / CAR_PITCH), 0, n - 1);
      if (idx === Math.round(carPos)) enterFocus(ids[idx]);     // 中央タップ → フォーカス
      else carTarget = idx;                                     // 横タップ → そこへスクロール
    }
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
    // 発色契約 (採用値 "ACES 標準"): sRGB + ACES exposure 1.05 + IBL。彩度/コントラストは canvas に CSS filter。
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    const cv = renderer.domElement;
    cv.className = 'o3d-canvas';
    cv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:6;pointer-events:none;filter:saturate(1.12) contrast(1.06);';
    container.appendChild(cv);

    scene = new THREE.Scene();
    // PBR の反射成分を起こす環境光(IBL)。無いと光沢部が黒く沈む。RoomEnvironment 未ロードでも壊さない。
    if (THREE.RoomEnvironment) {
      scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    }
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(0.5, 0.9, 1.2); scene.add(key);
    const rim = new THREE.DirectionalLight(0xbcd0ff, 0.35); rim.position.set(-0.6, 0.2, -1); scene.add(rim);

    camera = new THREE.PerspectiveCamera(cfg.FOV, w / h, 1, 6000);
    camera.position.set(0, 0, 0);                 // looks down -Z by default

    buildChrome();
    buildEdgeLayer();
    buildMediaLayer();
    buildThumbLayer();
    buildFocusDock();
    buildCarStrip();

    // tap = 写真フルスクリーン / 長押し = 3D フォーカスを 判別する press 検出をマップ canvas に付ける。
    const mcv = map.getCanvas();
    mcv.addEventListener('pointerdown', onPressDown);
    window.addEventListener('pointermove', onPressMove);
    window.addEventListener('pointerup', onPressUp);
    mcv.addEventListener('pointercancel', cancelPress);
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
    const entry = { id: m.id, lat: m.lat, lng: m.lng, url: m.url, cluster: m.cluster || null, group: null, faceY, onScreen: false, worldH: 1, spin: 0, mainK: 0 };
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
        mats.forEach((mm) => { if (mm) { mm.depthTest = true; mm.depthWrite = true; if ('envMapIntensity' in mm) mm.envMapIntensity = 0.5; } });
      });
      // capture a tiny portrait of THIS object for its edge-indicator chip.
      entry.thumb = captureThumb(model);
      // 縁チップは動画サムネ(thumbUrl)で固定 → GLB ロード後も 3D ポートレートで上書きしない。
      // notify subscribers (reel uses this to fill any cell whose file thumb 404'd)
      if (entry.thumb) thumbCbs.forEach((cb) => { try { cb(m.id, entry.thumb); } catch (e) {} });
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

      // ground shadow — a soft camera-facing ellipse pinned to the projected
      // lat/lng point. The object floats above it (see layout), so the gap reads
      // as "hovering". Drawn before/under the object, no depth write.
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthTest: false, depthWrite: false, opacity: cfg.SHADOW_OPACITY })
      );
      shadow.renderOrder = 0;
      shadow.visible = false;
      scene.add(shadow);
      entry.shadow = shadow;
    }, undefined, (err) => console.warn('objects3d load error', m.id, err));

    if (MeshoptReady) MeshoptReady.then(doLoad); else doLoad();
  }

  // ==========================================================================
  // CLUSTERING + REPRESENTATIVE — the single linkage model
  // ピンを *固定* クラスタ(posts.js の cluster 値)で bin → 画面中心に最も近い
  // クラスタをメインクラスタに → そのクラスタ内で中心に最も近い 1 投稿を代表(repId)に。
  // 代表は地図の巨大 main / リール白枠 / フォーカス対象 を貫く 1 本の id。
  // WHY 固定: 動的タイル bin だと密集地帯(渋谷中心)がタイル境界で割れてクラスタされない。
  // ==========================================================================

  // ----- ズーム連動クラスタ（毎フレーム再計算）------------------------------
  // WebMercator タイルで bin する (flutter EarthClusterEngine / Studio schematic と同一)。
  // 代表マーカーの表示位置はタイルセルの幾何中心 (= タイル中心) に一律に置く。
  let effCluster = new Map();   // id -> タイルキー "z/x/y"
  let effGroups = new Map();    // タイルキー -> [ids]
  let effCentroid = new Map();  // タイルキー -> { lat, lng }（= タイル中心。代表の表示位置は一律ここ）

  // flutter WebMercatorTile.fromLatLng と同一式。tileZ = floor(mapZoom)+1 (WebMercatorTileZoom.tileZForMapZoom)。
  function _tileZ() { return Math.floor(map.getZoom()) + 1; }
  function _tileXY(lat, lng, z) {
    const n = Math.pow(2, z); let r = lat * Math.PI / 180; const lim = Math.PI / 2 * 0.999;
    r = Math.max(-lim, Math.min(lim, r));
    return { x: Math.floor((lng + 180) / 360 * n), y: Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n) };
  }
  function _tileCenter(x, y, z) {
    const n = Math.pow(2, z);
    const lat = (yy) => 180 / Math.PI * Math.atan(Math.sinh(Math.PI * (1 - 2 * yy / n)));
    return { lat: (lat(y) + lat(y + 1)) / 2, lng: (x + 0.5) / n * 360 - 180 };
  }

  function recomputeEffectiveClusters() {
    const z = _tileZ();
    const nextCluster = new Map(), nextGroups = new Map(), nextCentroid = new Map();
    entries.forEach((en, id) => {
      if (typeof en.lat !== 'number' || typeof en.lng !== 'number') return;
      const t = _tileXY(en.lat, en.lng, z);
      const key = z + '/' + t.x + '/' + t.y;   // タイルキー（flutter と同一）
      if (!nextGroups.has(key)) { nextGroups.set(key, []); nextCentroid.set(key, _tileCenter(t.x, t.y, z)); }
      nextGroups.get(key).push(id);
      nextCluster.set(id, key);
    });
    effCluster = nextCluster; effGroups = nextGroups; effCentroid = nextCentroid;
  }
  function clusterKeyOf(en) { return effCluster.get(en.id) || ('solo:' + en.id); }
  // 代表の表示位置＝そのクラスタの重心座標（クラスタ未確定なら自身の座標にフォールバック）。
  function centroidOf(en) { return effCentroid.get(clusterKeyOf(en)) || { lat: en.lat, lng: en.lng }; }

  // bin every entry by its ZOOM-aware effective cluster; return the cluster nearest screen-center.
  function computeMainCluster() {
    const cells = new Map();   // cluster -> { ids, sumLat, sumLng, n }
    entries.forEach((en) => {
      const k = clusterKeyOf(en);                  // ズーム連動の有効クラスタキー
      let c = cells.get(k);
      if (!c) { c = { ids: [], sumLat: 0, sumLng: 0, n: 0 }; cells.set(k, c); }
      c.ids.push(en.id); c.sumLat += en.lat; c.sumLng += en.lng; c.n++;
    });
    const { w, h } = size();
    const cx = w / 2, cy = h * cfg.CENTER_Y_FRAC;
    let bestK = null, best = Infinity;
    cells.forEach((c, k) => {
      const cc = effCentroid.get(k) || { lat: c.sumLat / c.n, lng: c.sumLng / c.n };  // タイル中心で中心最近傍を判定
      const p = map.project([cc.lng, cc.lat]);
      const d = (p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy);
      if (d < best) { best = d; bestK = k; }
    });
    return { key: bestK, ids: bestK ? cells.get(bestK).ids.slice() : [] };
  }

  // pick the pin in `ids` nearest screen-center (the auto-representative).
  function nearestInCluster(ids) {
    const { w, h } = size();
    const cx = w / 2, cy = h * cfg.CENTER_Y_FRAC;
    let id = null, best = Infinity;
    ids.forEach((i) => {
      const en = entries.get(i); if (!en) return;
      const p = map.project([en.lng, en.lat]);
      const d = (p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy);
      if (d < best) { best = d; id = i; }
    });
    return id;
  }

  // recompute main cluster + representative each frame; fire onChange on change.
  function updateMainAndRep() {
    if (focusId) return;                  // selection frozen while focused
    const cl = computeMainCluster();
    let rebuild = false, repChanged = false;
    if (cl.key !== mainClusterKey) { mainClusterKey = cl.key; rebuild = true; }
    mainClusterIds = cl.ids;

    // 代表はカルーセル(下部の横並びリスト)が所有する。repId が無効な時だけ自動選定。
    if (!repId || mainClusterIds.indexOf(repId) === -1) {
      const auto = nearestInCluster(mainClusterIds);
      if (auto && auto !== repId) { repId = auto; repChanged = true; }
    }
    _mainId = repId;
    if (rebuild || repChanged) fireChange(rebuild);
  }

  function fireChange(rebuild) {
    const payload = { repId, clusterKey: mainClusterKey, ids: mainClusterIds.slice() };
    changeCbs.forEach((cb) => { try { cb(payload, !!rebuild); } catch (e) {} });
  }

  // public: promote a pin to representative. Locks auto-selection for REP_LOCK_MS
  // and (optionally) glides the map to re-center on it, so the map re-selects and
  // the white frame / giant main move together.
  function selectRepresentative(id, opts) {
    opts = opts || {};
    const en = entries.get(id); if (!en) return;
    repId = id;
    repLockUntil = performance.now() + (opts.lock != null ? opts.lock : cfg.REP_LOCK_MS);
    if (mainClusterIds.indexOf(id) === -1) mainClusterIds.push(id);
    _mainId = repId;
    if (opts.glide !== false) {
      const cc = centroidOf(en);   // 代表はクラスタ重心(tile center)に描画されるので glide 先も重心へ → コンテンツが画面中心に来る
      map.easeTo({ center: [cc.lng, cc.lat], duration: 650, easing: easeOutCubic });
    }
    fireChange(false);          // move the white frame now; cluster rebuild follows the glide
  }

  // ----- 3D media totem ------------------------------------------------------
  // A DOM layer (z2, under the 3D canvas) of vertical video cards. Each frame we
  // project the post's lat/lng and seat its card directly beneath the 3D object's
  // feet, scaling both with the same mainK — so object + video read as one mapped
  // pin (オブジェクトと動画を縦に並べ、一体としてマッピング).
  function buildMediaLayer() {
    mediaEl = document.createElement('div');
    mediaEl.className = 'o3d-media';
    // 中心(代表)オブジェクトの動画は画面左下に固定表示する → 下端スクリム(z40)より
    // 前面に出して、はっきり読めるようにする（side-tool 50 / status 60 の下）。
    mediaEl.style.cssText = 'position:absolute;inset:0;z-index:45;pointer-events:none;';
    container.appendChild(mediaEl);
  }
  function ensureMediaCard(en) {
    let c = mediaCards.get(en.id);
    if (c) return c;
    const post = (window.UniverseData && window.UniverseData.byId[en.id]) || {};
    const el = document.createElement('div');
    el.className = 'o3d-media-card';
    if (post.videoUrl) {
      el.innerHTML = '<div class="mclip"><video muted loop playsinline preload="auto"></video></div><span class="weld"></span>';
      const v = el.querySelector('video');
      v.src = post.videoUrl; v.play().catch(() => {});
    } else {
      el.innerHTML = '<div class="mclip"><img alt=""></div><span class="weld"></span>';
      el.querySelector('img').src = post.thumbUrl || '';
    }
    // マッピングされた動画をタップ → フルスクリーン（HTML 側の openStory を呼ぶ）。
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      mediaTapCbs.forEach((cb) => { try { cb(en.id, el); } catch (_) {} });
    });
    mediaEl.appendChild(el);
    c = { el, node: el.querySelector('video, img') };
    mediaCards.set(en.id, c);
    return c;
  }
  // 反転モード：動画カードを地図の lat/lng 点に「立てる」＝マーカー。点の少し上に下端を
  // 置き、足元に weld(接地影)。markerScaled は world 単位（代表は MAIN_SCALE で巨大化）。
  function positionMedia(en, p, markerScaled, vis) {
    const c = ensureMediaCard(en);
    if (!vis || !p) { c.el.style.display = 'none'; return; }
    c.el.style.display = '';
    const weld = c.el.querySelector('.weld');
    const objHpx = markerScaled / pxToWorld();           // marker height on screen (px)
    const cardW = objHpx * 0.62;
    const cardH = objHpx * 1.12;
    const floatPx = objHpx * cfg.FLOAT_FRAC;             // gap between card foot and the ground point
    const top = (p.y - floatPx) - cardH;                 // card stands on the projected point
    const left = p.x - cardW / 2;
    c.el.style.width = cardW + 'px';
    c.el.style.height = cardH + 'px';
    c.el.style.transform = 'translate(' + left + 'px,' + top + 'px)';
    c.el.style.zIndex = 3;
    c.el.style.pointerEvents = 'auto';                    // タップでフルスクリーンを開く
    c.el.style.cursor = 'pointer';
    // 接地影(weld)はカード足元ではなく *本来の lat/lng 点(p.y)* に落とす。
    // カードは floatPx 分だけその上に浮き、3D マーカーと同じ「浮いて見える」表現に。
    if (weld) { weld.style.display = ''; weld.style.bottom = (-floatPx) + 'px'; }
  }

  // フォーカス中：そのオブジェクトの動画カードを画面左下に出す（タップ→フルスクリーン）。
  function positionMediaCorner(en) {
    const c = ensureMediaCard(en);
    c.el.style.display = '';
    const { h } = size();
    const cardW = 104, cardH = 156;
    c.el.style.width = cardW + 'px';
    c.el.style.height = cardH + 'px';
    c.el.style.transform = 'translate(16px,' + (h - cardH - 40) + 'px)';
    c.el.style.zIndex = 3;
    c.el.style.pointerEvents = 'auto';
    c.el.style.cursor = 'pointer';
    const weld = c.el.querySelector('.weld'); if (weld) weld.style.display = 'none';
  }

  // ----- non-main cluster reps: flat mini-thumbnail markers ------------------
  // 新仕様「メイン=動画 / メインクラスタのメンバー=3D / それ以外の画面内=ミニサムネ」を満たすため、
  // 非メインクラスタの代表は 3D でなく静止画サムネを地図に立てる軽量 DOM 層。
  function buildThumbLayer() {
    thumbEl = document.createElement('div');
    thumbEl.className = 'o3d-thumbs';
    thumbEl.style.cssText = 'position:absolute;inset:0;z-index:44;pointer-events:none;';
    container.appendChild(thumbEl);
  }
  function ensureThumbCard(en) {
    let c = thumbCards.get(en.id);
    if (c) return c;
    const post = (window.UniverseData && window.UniverseData.byId[en.id]) || {};
    const el = document.createElement('div');
    el.className = 'o3d-thumb-card';
    el.style.cssText = 'position:absolute;border-radius:7px;overflow:hidden;border:1.5px solid rgba(255,255,255,.85);box-shadow:0 4px 12px rgba(0,0,0,.5);background:#222;will-change:transform;';
    el.innerHTML = '<img alt="" style="width:100%;height:100%;object-fit:cover;display:block;">';
    el.querySelector('img').src = post.thumbUrl || en.thumb || '';
    el.addEventListener('click', (e) => { e.stopPropagation(); selectRepresentative(en.id, { glide: true }); });
    thumbEl.appendChild(el);
    c = { el, img: el.querySelector('img') };
    thumbCards.set(en.id, c);
    return c;
  }
  // 地図の投影点 p に縦長ミニサムネを立てる（足元を点に合わせる）。sizePx=画面高(px)。
  function positionThumb(en, p, sizePx, vis) {
    const c = ensureThumbCard(en);
    if (!vis || !p) { c.el.style.display = 'none'; return; }
    c.el.style.display = '';
    const wpx = sizePx * 0.78, hpx = sizePx;
    c.el.style.width = wpx + 'px';
    c.el.style.height = hpx + 'px';
    c.el.style.transform = 'translate(' + (p.x - wpx / 2) + 'px,' + (p.y - hpx) + 'px)';
    c.el.style.pointerEvents = 'auto';
    c.el.style.cursor = 'pointer';
  }

  // ----- focus-state member dock --------------------------------------------
  // フォーカス中だけ、クラスタの「裏に隠れている」メンバーを画面下部に 3D サムネで
  // 並べる。タップでフォーカス対象をそのオブジェクトへ切り替える。
  function buildFocusDock() {
    dockEl = document.createElement('div');
    dockEl.className = 'o3d-dock';
    dockEl.innerHTML = '';
    dockCapEl = null;
    container.appendChild(dockEl);
    dockEl.addEventListener('pointerdown', onDockDown);
    window.addEventListener('pointermove', onDockMove);
    window.addEventListener('pointerup', onDockUp);
    dockEl.addEventListener('wheel', onDockWheel, { passive: false });
  }
  function currentMembers() {
    return (focusId != null) ? mainClusterIds.filter((id) => id !== focusId) : [];
  }
  function dockItemEl(en) {
    let it = dockItems.get(en.id);
    if (it) return it;
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'o3d-dock-item';
    el.setAttribute('data-id', en.id);
    el.innerHTML = '<span class="ring"></span><span class="disc"><img alt=""></span>';
    if (en.thumb) el.querySelector('img').src = en.thumb;
    it = { el, img: el.querySelector('img') };
    dockItems.set(en.id, it);
    return it;
  }
  function updateDock() {
    if (!dockEl) return;
    dockEl.style.display = 'none';   // フォーカス中のメンバードックは表示しない
    return;
    /* eslint-disable no-unreachable */
    const active = focusId != null;
    const a = focusDir > 0 ? easeOutCubic(focusT) : (1 - easeOutCubic(1 - focusT));
    dockEl.style.opacity = active ? a : 0;
    dockEl.style.pointerEvents = (active && focusT > 0.5) ? 'auto' : 'none';

    const members = currentMembers();
    // reset the carousel whenever the member set changes (e.g. after a switch)
    const sig = members.join(',');
    if (sig !== dockSig) { dockSig = sig; dockScroll = 0; dockTarget = 0; dockDragging = false; }

    const want = new Set(members);
    dockItems.forEach((it, id) => { if (!want.has(id)) it.el.style.display = 'none'; });
    if (!members.length) { if (dockCapEl) dockCapEl.style.opacity = '0'; return; }

    // settle toward the snap target unless actively dragging
    if (!dockDragging) dockScroll += (dockTarget - dockScroll) * DOCK.EASE;

    const W = dockEl.clientWidth || 1, H = dockEl.clientHeight || 1;
    const ax = W * DOCK.AX, ay = H * DOCK.AY;
    let apexId = null, apexAbs = Infinity;

    members.forEach((id, i) => {
      const en = entries.get(id); if (!en) return;
      const it = dockItemEl(en);
      if (it.el.parentNode !== dockEl) dockEl.appendChild(it.el);
      it.el.style.display = '';
      if (en.thumb && it.img.getAttribute('src') !== en.thumb) it.img.src = en.thumb;

      // angular offset from the apex; place along the hill arc (apex highest).
      const th = (i - dockScroll) * DOCK.STEP;
      const ath = Math.abs(th);
      if (ath > DOCK.CULL) { it.el.style.opacity = '0'; it.el.style.pointerEvents = 'none'; it.el.classList.remove('apex'); return; }
      const k = 1 - ath / DOCK.CULL;                 // 1 at apex → 0 at cull edge
      const x = ax + DOCK.R * Math.sin(th);
      const y = ay + DOCK.R * (1 - Math.cos(th));
      const scale = 0.6 + 0.62 * k;                  // ≈1.22 apex → 0.6 edge
      it.el.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
      it.el.style.opacity = String(0.3 + 0.7 * k);
      it.el.style.zIndex = String(120 - Math.round(ath * 40));
      it.el.style.pointerEvents = 'auto';
      it.el.classList.toggle('apex', ath < DOCK.STEP * 0.5);
      if (ath < apexAbs) { apexAbs = ath; apexId = id; }
    });

    // caption under the apex member (its circle name)
    if (dockCapEl) {
      const D = window.UniverseData;
      const post = apexId && D && D.byId[apexId];
      const circle = post && D.circles[post.circleId];
      dockCapEl.querySelector('b').textContent = circle ? circle.name : '';
      const capY = ay + 33 * 1.22 + 12;              // just below the enlarged apex disc
      dockCapEl.style.transform = 'translate(' + ax + 'px,' + capY + 'px) translateX(-50%)';
      dockCapEl.style.opacity = (active && focusT > 0.55 && apexId) ? String(a) : '0';
    }
  }
  // drag / wheel to slide the arc; a tap (no drag) switches focus to that member.
  function onDockDown(e) {
    if (focusId == null || focusT < 0.5) return;
    e.stopPropagation();
    dockDragging = true; dockMoved = false;
    dockStartX = e.clientX; dockStartScroll = dockScroll;
  }
  function onDockMove(e) {
    if (!dockDragging) return;
    const dx = e.clientX - dockStartX;
    if (Math.abs(dx) > 5) dockMoved = true;
    const span = DOCK.R * DOCK.STEP;                 // px traveled per member at the apex
    const n = currentMembers().length;
    dockScroll = clamp(dockStartScroll - dx / span, 0, Math.max(0, n - 1));
  }
  function onDockUp(e) {
    if (!dockDragging) return;
    dockDragging = false;
    const n = currentMembers().length;
    if (dockMoved) {
      dockTarget = clamp(Math.round(dockScroll), 0, Math.max(0, n - 1));
    } else {
      const itEl = e.target && e.target.closest && e.target.closest('.o3d-dock-item');
      const id = itEl && itEl.getAttribute('data-id');
      if (id) switchFocus(id);
    }
  }
  function onDockWheel(e) {
    if (focusId == null) return;
    e.preventDefault();
    const n = currentMembers().length;
    dockTarget = clamp(dockTarget + (e.deltaY > 0 ? 1 : -1), 0, Math.max(0, n - 1));
  }
  // switch the focused object to a dock member (it also becomes the representative).
  function switchFocus(id) {
    const en = entries.get(id); if (!en) return;
    selectRepresentative(id, { glide: false });   // 代表をそれに（フォーカス中は自動再選定なし）
    focusId = id; focusDir = 1;                    // フォーカス対象を切り替え
    spinY = 0; spinX = 0; velY = 0;
    focusT = Math.max(focusT * 0.6, 0.45);         // 少し縮めて再拡大 → 入れ替わりが分かる
    dockScroll = 0; dockTarget = 0; dockSig = '';  // 新しいメンバー集合で弧をリセット
    if (container) container.classList.add('o3d-focus-active');
  }

  // ----- per-frame layout + render ------------------------------------------
  // place an entry's soft ground ellipse at its projected lat/lng point (the
  // cluster's spot on the map), sized to the floating marker's footprint.
  function placeShadow(en, p, markerScaled) {
    const sh = en.shadow; if (!sh) return;
    const mk = screenToPlane(p.x, p.y);                 // ground point under the marker
    sh.scale.set(markerScaled * cfg.SHADOW_W, markerScaled * cfg.SHADOW_H, 1);
    sh.position.set(mk.x, mk.y, -cfg.DIST);
    sh.renderOrder = 2;                                 // under the object (renderOrder 3)
    sh.visible = true;
  }

  function layout() {
    const { w, h } = size();
    const markerWorld = cfg.MARKER_PX * pxToWorld();
    const focusWorld = Math.min(w, h) * cfg.FOCUS_FRAC * pxToWorld();
    const ease = focusDir > 0 ? easeOutCubic(focusT) : (1 - easeOutCubic(1 - focusT));
    const dockIds = dockList();
    const dockN = dockIds.length;

    // 中心にないクラスタは「代表 1 つだけ」を地図に出す（メンバー全部は出さない）。
    // 各非メインクラスタごとに、画面中心に最も近いメンバーを代表に選ぶ。
    const ccx = w / 2, ccy = h * cfg.CENTER_Y_FRAC;
    const nonMainRep = {};   // clusterKey -> 代表 id
    const nonMainBest = {};  // clusterKey -> 中心からの距離^2
    entries.forEach((en) => {
      const k = clusterKeyOf(en);
      if (k === mainClusterKey) return;            // メインクラスタはドック＋メディアで別扱い
      const pp = map.project([en.lng, en.lat]);
      const d2 = (pp.x - ccx) * (pp.x - ccx) + (pp.y - ccy) * (pp.y - ccy);
      if (nonMainBest[k] === undefined || d2 < nonMainBest[k]) { nonMainBest[k] = d2; nonMainRep[k] = en.id; }
    });
    // 地図にマーカーとして出る代表 id（縁指標の対象）＝メイン代表 + 各非メインクラスタの代表。
    mapMarkerIds = Object.keys(nonMainRep).map((k) => nonMainRep[k]);
    if (repId) mapMarkerIds.push(repId);

    entries.forEach((en) => {
      const g = en.group; if (!g) return;
      const isFocus = en.id === focusId;
      const slotIdx = dockIds.indexOf(en.id);

      // smooth grow/shrink toward the representative scale (no pop while panning).
      // 巨大 main は常に repId（単一の真実）。フォーカス中は選定を止める。
      const mainTarget = (!focusId && en.id === repId) ? 1 : 0;
      en.mainK += (mainTarget - en.mainK) * cfg.MAIN_LERP;
      if (en.mainK < 0.001) en.mainK = 0;
      const markerScaled = markerWorld * (1 + en.mainK * (cfg.MAIN_SCALE - 1));

      if (isFocus) {
        // フォーカス：ドック行のそのスロットから画面中央へ飛んで拡大する。
        const slot = dockSlot(slotIdx < 0 ? Math.round(carPos) : slotIdx);
        const startScale = slot.objHpx * pxToWorld();
        const mk = screenToPlane(slot.sx, slot.sy);
        const wH = lerp(startScale, focusWorld, ease);
        g.scale.setScalar(wH);
        g.position.set(lerp(mk.x, 0, ease), lerp(mk.y, 0, ease), -cfg.DIST);
        g.rotation.y = en.faceY + spinY;
        g.rotation.x = spinX;
        g.visible = true;
        g.renderOrder = 10;
        if (en.shadow) en.shadow.visible = false;
        positionMedia(en, null, 0, false);          // フォーカス中は左下カードを出さない（背景の動画で十分）
        positionThumb(en, null, 0, false);
      } else {
        // 反転：メインクラスタの全オブジェクトを画面下に横並び、代表の動画だけを地図にマッピング。
        const p = map.project([en.lng, en.lat]);
        const onScreen = p.x > -cfg.CULL_MARGIN && p.x < w + cfg.CULL_MARGIN &&
                         p.y > -cfg.CULL_MARGIN && p.y < h + cfg.CULL_MARGIN;
        const hidden = focusId && ease > 0.04;
        const inDock = slotIdx >= 0;
        const isRep = en.id === repId;
        const inMain = mainClusterIds.indexOf(en.id) !== -1;
        if (inMain) {
          // メインクラスタ（中心に来たクラスタ）：オブジェクトは画面下のドックへ、
          // 代表の動画だけを地図の lat/lng 点にマッピング（現状どおり）。
          // 下のオブジェリストはフォーカス中もずっと表示（フォーカス対象は中央の大表示へ抜ける）。
          g.visible = inDock;
          if (g.visible) {
            const slot = dockSlot(slotIdx);
            const isCenter = slotIdx === Math.round(carPos);
            const dockScale = slot.objHpx * pxToWorld() * (isCenter ? 1.6 : 1);   // 中央のオブジェクトは 1.6 倍
            const mk = screenToPlane(slot.sx, slot.sy);
            g.scale.setScalar(dockScale);
            g.position.set(mk.x, mk.y, -cfg.DIST);
            // リストのオブジェクトは中央(代表)も含めて全て自動回転（位相は step() がロード後から個別に進める）。
            g.rotation.set(0, en.faceY + en.spin, 0);
            g.renderOrder = isCenter ? 4 : 3;
          }
          if (en.shadow) en.shadow.visible = false;   // ドックしたオブジェクトは地図の接地影なし
          // 動画カードは代表をクラスタ重心点に立てるマーカーとして表示（一律中心）。
          if (isRep && onScreen && !hidden) { const cc = centroidOf(en); positionMedia(en, map.project([cc.lng, cc.lat]), markerScaled, true); }
          else positionMedia(en, null, 0, false);
          positionThumb(en, null, 0, false);            // メインクラスタのメンバーは 3D（カルーセル）。サムネは出さない
        } else {
          // 中心にないクラスタ：動画も 3D も出さず、代表 1 つを「ミニサムネ」で地図に立てる。
          // 新仕様: メイン=動画 / メインクラスタのメンバー=3D / それ以外の画面内=ミニサムネ。
          // タップ → glide で中心へ来て新メイン（動画表示）。
          positionMedia(en, null, 0, false);
          g.visible = false;                                 // 3D は出さない（サムネのみ）
          if (en.shadow) en.shadow.visible = false;
          const clusterKey = clusterKeyOf(en);
          const isClusterRep = nonMainRep[clusterKey] === en.id;
          if (isClusterRep && onScreen && !hidden) {
            const cc = centroidOf(en);                       // 代表はクラスタ重心に置く（個々の投稿位置ではなく）
            const pc = map.project([cc.lng, cc.lat]);
            const objHpx = markerWorld / pxToWorld();        // 3D マーカー相当の画面高(px)
            positionThumb(en, pc, objHpx * 0.72, true);      // ミニサムネ（3D より一回り小さく）
          } else {
            positionThumb(en, null, 0, false);
          }
        }
      }
    });
  }

  function step() {
    // ズーム連動クラスタを先に再計算（投影ピクセル距離 → 併合/分裂）。
    recomputeEffectiveClusters();
    // recompute main cluster + representative (the single linkage source)
    updateMainAndRep();
    // 各オブジェクトの自動回転は、その GLB のロード完了(group 生成)後から個別に進める。
    // → ロード時刻がバラけるぶん位相が揃わず、同時ではなく独立して回り始めて見える。
    if (cfg.IDLE_SPIN) entries.forEach((en) => { if (en.group) en.spin += cfg.IDLE_SPIN; });
    // focus progress (≈320ms easeOutCubic in/out)
    if (focusDir > 0 && focusT < 1) focusT = Math.min(1, focusT + cfg.FOCUS_STEP);
    if (focusDir < 0 && focusT > 0) {
      focusT = Math.max(0, focusT - cfg.FOCUS_STEP);
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
      scrimEl.style.opacity = vis ? a * 0.4 : 0;
      chromeEl.style.opacity = vis ? a : 0;
      if (focusGradEl) focusGradEl.style.opacity = vis ? a : 0;
      if (focusBgEl) {
        focusBgEl.style.opacity = vis ? a : 0;
        if (vis && focusId && focusBgEl.dataset.id !== focusId) {
          focusBgEl.dataset.id = focusId;
          const en0 = entries.get(focusId);
          const post0 = window.UniverseData && window.UniverseData.byId[focusId];
          const vurl = post0 && post0.videoUrl;
          // 背景は動画があれば動画（左下カードと一致）、無ければサムネ画像をぼかして敷く。
          if (vurl) {
            focusBgEl.style.backgroundImage = 'none';
            focusBgEl.innerHTML = '<video muted playsinline preload="auto" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"></video>';
            const v = focusBgEl.querySelector('video'); v.src = vurl;
            // 背景は再生しない：最初のフレームで静止させる。
            v.addEventListener('loadeddata', () => { try { v.pause(); if (v.currentTime < 0.05) v.currentTime = 0.05; } catch (_) {} }, { once: true });
          } else {
            const url = (post0 && post0.thumbUrl) || (en0 && en0.thumb) || '';
            focusBgEl.innerHTML = '';
            focusBgEl.style.backgroundImage = url ? 'url("' + url + '")' : 'none';
          }
        }
      }
      if (mediaEl) mediaEl.style.zIndex = focusId ? 59 : 45;   // フォーカス中は左下動画をオービトより前面へ
      if (playEl) playEl.style.pointerEvents = (vis && focusT > 0.3) ? 'auto' : 'none';
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
        // 再生ボタンはリストの一部：フォーカス対象が抜けたスロットへ入り、スクロールに追従する。
        // → 位置は dockSlot(フォーカス対象の index) で算出（carPos 連動）。ドラッグで一緒に流れ、
        //   中央に収まると停止。リスト内のオブジェクトが「フォーカス＝再生ボタン」に化けて見える。
        if (playEl) {
          const dockIds = dockList();
          const fidx = dockIds.indexOf(focusId);
          const slot = dockSlot(fidx >= 0 ? fidx : Math.round(carPos));
          playEl.style.left = slot.sx + 'px';
          playEl.style.top = slot.sy + 'px';
          playEl.style.bottom = 'auto';
          playEl.style.transform = 'translate(-50%,-50%)';
        }
      }
    }

    // 下部カルーセル：ターゲットへイージング。中央に来たものを代表に（フォーカス中はフォーカス対象に）。
    {
      const ids = dockList();
      if (ids.length) {
        // メインクラスタが切り替わったら、そのクラスタ固有の選択を復元する（index は共有しない）。
        // 直近に明示選択(selectRepresentative)した代表はロック中なら尊重。無ければ前回選択／中心最寄り。
        if (mainClusterKey !== carClusterKey) {
          carClusterKey = mainClusterKey;
          const locked = performance.now() < repLockUntil;
          let want;
          if (locked && ids.indexOf(repId) !== -1) { want = repId; }
          else { want = clusterSel.get(mainClusterKey); if (!want || ids.indexOf(want) === -1) want = (ids.indexOf(repId) !== -1) ? repId : ids[0]; }
          carPos = carTarget = Math.max(0, ids.indexOf(want));
          carInit = true;
          if (want && want !== repId && !focusId) { repId = want; _mainId = repId; fireChange(false); }
          clusterSel.set(mainClusterKey, want);
        }
        if (!carInit) { carPos = Math.max(0, ids.indexOf(repId)); carTarget = carPos; carInit = true; }
        if (!carDragging) carPos += (carTarget - carPos) * 0.18;
        const ci = clamp(Math.round(carPos), 0, ids.length - 1);
        const cid = ids[ci];
        if (cid) {
          if (focusId) { if (cid !== focusId) switchFocus(cid); }   // フォーカス中：中心のものへフォーカス切替
          else if (cid !== repId) { repId = cid; _mainId = repId; fireChange(false); }
          if (!focusId) clusterSel.set(mainClusterKey, cid);        // このクラスタの選択を記憶
        }
      }
      // リストは常に操作可能。フォーカス中はオービット用キャンバス(z57)より上に出して下端で操作。
      if (carStripEl) { carStripEl.style.pointerEvents = 'auto'; carStripEl.style.zIndex = focusId ? 57 : 8; }
    }

    layout();
    updateEdges();
    updateDock();
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

  // raycast a container-space pixel → the entry whose visible marker is hit (or null).
  function raycastAt(px, py) {
    const { w, h } = size();
    ndc.x = (px / w) * 2 - 1;
    ndc.y = -((py / h) * 2 - 1);
    raycaster.setFromCamera(ndc, camera);
    const objs = [];
    entries.forEach((en) => { if (en.group && en.group.visible) objs.push(en.group); });
    const hits = raycaster.intersectObjects(objs, true);
    return hits.length ? entryFromObject(hits[0].object) : null;
  }

  function cancelPress() {
    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
    pressEntry = null; pressStart = null;
  }

  // pointerdown on the map: figure out which object (if any) is under the finger,
  // and arm a long-press timer. Holding still past LONG_PRESS_MS → 3D focus.
  function onPressDown(e) {
    if (focusId) return;                 // already focused — orbit handlers take over
    const rect = container.getBoundingClientRect();
    pressEntry = raycastAt(e.clientX - rect.left, e.clientY - rect.top);
    pressStart = { x: e.clientX, y: e.clientY };
    pressMoved = false; longFired = false;
    if (pressTimer) clearTimeout(pressTimer);
    if (pressEntry) {
      pressTimer = setTimeout(() => {
        pressTimer = null;
        if (pressMoved || focusId || !pressEntry) return;
        longFired = true;                // 長押し → フォーカス（320ms easeOutCubic・全画面・360°）
        enterFocus(pressEntry.id);
      }, cfg.LONG_PRESS_MS);
    }
  }

  // any meaningful movement → it's a globe drag, not a press: cancel tap & long-press.
  function onPressMove(e) {
    if (!pressStart) return;
    if (Math.abs(e.clientX - pressStart.x) + Math.abs(e.clientY - pressStart.y) > cfg.PRESS_MOVE_TOL) {
      pressMoved = true;
      if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
    }
  }

  // pointerup: a quick tap (no drag, long-press not yet fired) routes to:
  //   ・代表(repId) を タップ → onTap 発火（= リストの写真をフルスクリーン表示）
  //   ・非メイン を タップ   → 地図がそこへ glide して新しいメイン（代表）に
  function onPressUp() {
    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
    const en = pressEntry; const moved = pressMoved; const fired = longFired;
    pressEntry = null; pressStart = null;
    if (focusId || fired || moved || !en) return;
    if (en.id === repId) enterFocus(en.id);                 // タップ → フォーカス状態へ
    else selectRepresentative(en.id, { glide: true });
  }

  function panToEntry(en) {
    if (!en) return;
    const cc = centroidOf(en);     // 投稿実位置ではなくクラスタ重心(tile center)へ寄せる(代表サムネの描画位置と一致)
    map.easeTo({
      center: [cc.lng, cc.lat],
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
    orbiting = false;                                  // フォーカス中はドラッグ回転のみ（タップ動作なし）
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
  const EDGE_LS = 'toopdbq.edgeInd.v3';
  const EDGE_DEFAULTS = {
    enabled: true,
    style: 'portrait',   // portrait | arrow | dot — サムネ
    size: 56,            // chip diameter (px)
    showDistance: false, // 距離ラベルなし
    pulse: true,
    maxCount: 1,         // いっぺんに 1 つまで
    sparseMax: 99,       // 常に表示（画面内の数に関係なく出す）
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
    thumbR.outputEncoding = THREE.sRGBEncoding;
    thumbR.toneMapping = THREE.ACESFilmicToneMapping;
    thumbR.toneMappingExposure = 1.05;
    thumbScene = new THREE.Scene();
    if (THREE.RoomEnvironment) {
      thumbScene.environment = new THREE.PMREMGenerator(thumbR).fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    }
    thumbScene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const k = new THREE.DirectionalLight(0xffffff, 1.1); k.position.set(0.45, 0.9, 1.1); thumbScene.add(k);
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
      holder.rotation.set(0, -Math.PI / 2, 0);   // GLB 既定は右(+X)向き → -90°で正面(カメラ)向き
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
  // 縁チップの絵柄は「動画のサムネイル画像」(投稿の thumbUrl) を使う。3D ポートレート(en.thumb)
  // ではなく、投稿が持つ生成元写真/動画サムネを出す。無ければ 3D ポートレートにフォールバック。
  function edgeThumbFor(en) {
    const post = window.UniverseData && window.UniverseData.byId && window.UniverseData.byId[en.id];
    return (post && (post.thumbUrl || post.posterUrl)) || en.thumb || '';
  }
  function ensureChip(en) {
    let c = edgeChips.get(en.id);
    if (c) return c;
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'o3d-edge-chip';
    el.innerHTML = '<span class="disc"><img alt=""></span><span class="arrow"></span><span class="dist"></span>';
    const t0 = edgeThumbFor(en); if (t0) el.querySelector('img').src = t0;
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

  // 視点中心 → 対象 の初期方位（rad, 0=北・時計回り）。globe で project() が裏側/画面外に
  // 返す不正値に依らず、地理的な真方向を出す。
  function bearingRad(lat1, lng1, lat2, lng2) {
    const toR = Math.PI / 180;
    const p1 = lat1 * toR, p2 = lat2 * toR, dL = (lng2 - lng1) * toR;
    const y = Math.sin(dL) * Math.cos(p2);
    const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dL);
    return Math.atan2(y, x);
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
      if (en.id !== repId && mapMarkerIds.indexOf(en.id) === -1) { hideChip(en.id); return; }   // 地図に出る各クラスタ代表のみ縁指標
      const cc = centroidOf(en);                     // 縁指標もクラスタ重心を指す
      const p = map.project([cc.lng, cc.lat]);
      if (p.x >= rc.l && p.x <= rc.r && p.y >= rc.t && p.y <= rc.b) { insidePts.push(p); hideChip(en.id); return; }
      off.push({ en, p, dm: haversine(ctr.lat, ctr.lng, cc.lat, cc.lng) });
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
    const mb = ((map.getBearing && map.getBearing()) || 0) * Math.PI / 180;   // 地図の回転
    const placed = shown.map(({ en, dm }) => {
      // 方向は GEO 方位（ビュー中心 → クラスタ重心）から決める。配置辺と矢印を同じ値から導くので必ず一致。
      // screen: 北=上(dy=-1) 東=右(dx=+1)、地図回転 mb を引く。
      const cc = centroidOf(en);
      const sb = bearingRad(ctr.lat, ctr.lng, cc.lat, cc.lng) - mb;
      const dx = Math.sin(sb), dy = -Math.cos(sb);
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
      const et = edgeThumbFor(pl.en); if (c.img && et && c.img.getAttribute('src') !== et) c.img.src = et;
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
    g.appendChild(_range('最大表示数', 'maxCount', 1, 11, 1, ''));
    body.insertBefore(g, body.firstChild);
  }
  function buildLinkPanel() {
    const body = document.getElementById('panelBody');
    if (!body) return;
    const old = body.querySelector('#link-group'); if (old) old.remove();
    const g = document.createElement('div'); g.className = 'group'; g.id = 'link-group';
    const gt = document.createElement('div'); gt.className = 'gt';
    gt.innerHTML = '連携モデル <span class="id">posts.js ↔ objects3d.js</span>';
    g.appendChild(gt);
    g.appendChild(_cfgRange('クラスタ距離(ズーム連動)', 'CLUSTER_PX', 30, 160, 2, 'px'));
    g.appendChild(_cfgRange('巨大 main 拡大率', 'MAIN_SCALE', 1.4, 3.4, 0.1, '×'));
    g.appendChild(_cfgRange('フォーカスサイズ', 'FOCUS_FRAC', 0.6, 0.95, 0.01, ''));
    body.insertBefore(g, body.firstChild);
  }
  // a range bound to a numeric key on `cfg` (the linkage tunables)
  function _cfgRange(label, key, min, max, step, unit) {
    const wrap = document.createElement('div'); wrap.className = 'ctrl';
    const lab = document.createElement('div'); lab.className = 'lab';
    const val = document.createElement('b'); val.textContent = cfg[key] + (unit || '');
    lab.innerHTML = `<span>${label}</span>`; lab.appendChild(val);
    const inp = document.createElement('input');
    inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step; inp.value = cfg[key];
    inp.oninput = () => {
      const v = parseFloat(inp.value); val.textContent = v + (unit || ''); cfg[key] = v;
      mainClusterKey = null;   // force a cluster re-evaluation on next frame
    };
    wrap.appendChild(lab); wrap.appendChild(inp); return wrap;
  }
  function setupEdgePanel() {
    buildLinkPanel();
    buildEdgePanel();
    if (window.EarthLook && !window.EarthLook._edgePatched) {
      const orig = window.EarthLook.buildPanel;
      window.EarthLook.buildPanel = function () { orig.apply(this, arguments); buildLinkPanel(); buildEdgePanel(); };
      window.EarthLook._edgePatched = true;
    }
  }

  window.Objects3D = {
    init,
    focus: enterFocus,
    exitFocus,
    selectRepresentative,
    onChange(cb) { if (typeof cb === 'function') { changeCbs.push(cb); if (mainClusterKey) cb({ repId, clusterKey: mainClusterKey, ids: mainClusterIds.slice() }, true); } },
    onTap(cb) { if (typeof cb === 'function') tapCbs.push(cb); },
    onThumb(cb) { if (typeof cb === 'function') { thumbCbs.push(cb); entries.forEach((en) => { if (en.thumb) cb(en.id, en.thumb); }); } },
    onMediaTap(cb) { if (typeof cb === 'function') mediaTapCbs.push(cb); },
    thumbFor(id) { const en = entries.get(id); return en ? en.thumb : null; },
    get rep() { return repId; },
    get cluster() { return mainClusterIds.slice(); },
    get focused() { return focusId; },
    get main() { return repId; },
    edge: { get cfg() { return EDGE; }, refresh() { applyEdge(); } },
    _tick() { step(); },
    cfg,
    debug() {
      const o = []; entries.forEach((e) => o.push({ id: e.id, sz: e._sz, loaded: !!e.group, vis: e.group && e.group.visible, scale: e.group && e.group.scale.x }));
      return { markerWorld: cfg.MARKER_PX * pxToWorld(), pxToWorld: pxToWorld(), halfH: halfH(), entries: o };
    },
  };
})();
