// ============================================================================
// models.js — Tripo 生成 GLB を MapLibre 上に 3D 配置する custom layer
//
// pins.js が「lat/lng を screen 投影して Flutter overlay に描く」のに対し、
// 本モジュールは Three.js (GLTFLoader) で GLB を地図の WebGL コンテキストに
// 直接描画する。地図の pitch / bearing / zoom に追従し、地形に乗って見える。
//
// 公開 API:
//   window.setModels({ models: [{ id, lat, lng, url, scale? }] })
//     - scale: モデルの実寸 (m)。未指定は DEFAULT_SCALE_M。
//     - 差分適用: 新規 url をロード、消えた id を破棄。
//
// 構造は scripts/tripo/viewer/globe.html (動作確認済みの参照実装) に合わせる:
//   - scene / camera / loader は **グローバルに 1 度だけ** 生成する
//   - renderer は **onAdd でのみ** 生成する (map の GL コンテキストに束縛するため。
//     _loadEntry 等から gl 無しで生成すると別コンテキストに描画され不可視になる)
//   - render 第2引数は MapLibre v5 では matrix 配列でなくオブジェクト
//     (`defaultProjectionData.mainMatrix` に MVP が入る)
//
// 依存: map-core.js の `map`、bridge.js の `dlog`。three / GLTFLoader は CDN。
// ============================================================================

const MODELS_LAYER_ID = "tripo-models";
// GLB は正規化された ~1 単位が多い。zoom 14 で地表に視認可能な footprint にする
// 実寸 (m)。小さすぎる (~80) と地図上で点になり見えない。per-model の scale で上書き可。
const DEFAULT_SCALE_M = 400;

// id -> { lat, lng, url, scale, object|null }
const _modelEntries = new Map();

// scene / camera / loader はグローバルに 1 度だけ生成 (renderer は onAdd で生成)。
const _modelScene = new THREE.Scene();
_modelScene.add(new THREE.AmbientLight(0xffffff, 0.9));
const _modelDirLight = new THREE.DirectionalLight(0xffffff, 0.7);
_modelDirLight.position.set(0, -70, 100).normalize();
_modelScene.add(_modelDirLight);
const _modelCamera = new THREE.Camera();
const _modelLoader = new THREE.GLTFLoader();
if (window.MeshoptDecoder) _modelLoader.setMeshoptDecoder(MeshoptDecoder); // meshopt 圧縮 GLB 対応

let _modelRenderer = null; // onAdd で map の GL コンテキストに束縛して生成
let _layerAdded = false;
let _pendingModels = []; // setModels が style 未ロード時に保持する最新の models
let _pendingScheduled = false; // idle 待ちの再適用が予約済みか (多重予約防止)

// MapLibre v5: custom layer の render 第2引数は matrix 配列でなくオブジェクト
// (Float64Array を内包)。globe projection でも `defaultProjectionData.mainMatrix`
// に mercator MVP が入る。配列前提で扱うと NaN 行列になりモデルが不可視になる。
function _extractMatrix(arg) {
  if (Array.isArray(arg)) return arg;
  if (arg && arg.defaultProjectionData && arg.defaultProjectionData.mainMatrix) {
    return arg.defaultProjectionData.mainMatrix;
  }
  return arg;
}

// MapLibre MVP matrix に対し、anchor (lng,lat) の mercator 変換を掛けた
// camera projection matrix を作る (Three Y-up → mercator Z-up 補正含む)。
function _anchorMatrix(mapMatrix, entry) {
  const mc = maplibregl.MercatorCoordinate.fromLngLat([entry.lng, entry.lat], 0);
  const s = mc.meterInMercatorCoordinateUnits() * (entry.scale || DEFAULT_SCALE_M);
  const rotX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  const l = new THREE.Matrix4()
    .makeTranslation(mc.x, mc.y, mc.z)
    .scale(new THREE.Vector3(s, -s, s))
    .multiply(rotX);
  return new THREE.Matrix4().fromArray(mapMatrix).multiply(l);
}

function _renderOne(entry, mapMatrix) {
  entry.object.visible = true;
  _modelCamera.projectionMatrix = _anchorMatrix(mapMatrix, entry);
  _modelRenderer.resetState();
  _modelRenderer.render(_modelScene, _modelCamera);
  entry.object.visible = false;
}

const _modelLayer = {
  id: MODELS_LAYER_ID,
  type: "custom",
  renderingMode: "3d",
  onAdd: function (_map, gl) {
    _modelRenderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true,
    });
    _modelRenderer.autoClear = false;
  },
  render: function (gl, arg) {
    if (!_modelRenderer) return;
    const mapMatrix = _extractMatrix(arg);
    let drewAny = false;
    // 1 オブジェクト = 1 anchor。可視を 1 個ずつ切替えて個別 render する。
    _modelEntries.forEach((entry) => {
      if (!entry.object) return;
      _renderOne(entry, mapMatrix);
      drewAny = true;
    });
    if (drewAny) map.triggerRepaint();
  },
};

function _addLayerIfNeeded() {
  if (_layerAdded) return;
  if (!map.isStyleLoaded()) return;
  map.addLayer(_modelLayer);
  _layerAdded = true;
}

function _loadEntry(entry) {
  _modelLoader.load(
    entry.url,
    (gltf) => {
      const obj = gltf.scene;
      obj.visible = false;
      // basemap (fill-extrusion 等) の深度バッファに隠されないよう深度テスト無効化。
      obj.traverse((o) => {
        if (!o.material) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (!m) return;
          m.depthTest = false;
          m.depthWrite = false;
          m.needsUpdate = true;
        });
        o.renderOrder = 999;
      });
      _modelScene.add(obj);
      entry.object = obj;
      dlog("model-loaded", { id: entry.id });
      map.triggerRepaint();
    },
    undefined,
    (err) => dlog("model-load-error", { id: entry.id, err: String(err) })
  );
}

function _disposeEntry(entry) {
  if (entry.object) {
    _modelScene.remove(entry.object);
    entry.object.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => m && m.dispose && m.dispose());
      }
    });
  }
}

window.setModels = function (payload) {
  try {
    const models = (payload && payload.models) || [];
    if (!map.isStyleLoaded()) {
      // 最新の models だけを保持。idle 再適用は 1 つだけ予約する。
      // (多重予約すると後発の idle が空配列で発火し、追加済みエントリを消す)
      _pendingModels = models;
      if (!_pendingScheduled) {
        _pendingScheduled = true;
        map.once("idle", () => {
          _pendingScheduled = false;
          window.setModels({ models: _pendingModels });
        });
      }
      return;
    }
    _addLayerIfNeeded();

    const nextIds = new Set(models.map((m) => m.id));
    // 消えた entry を破棄
    Array.from(_modelEntries.keys()).forEach((id) => {
      if (!nextIds.has(id)) {
        _disposeEntry(_modelEntries.get(id));
        _modelEntries.delete(id);
      }
    });
    // 追加 / 更新 (url が変わったら再ロード)
    models.forEach((m) => {
      if (!m || !m.id || !m.url || typeof m.lat !== "number" || typeof m.lng !== "number") return;
      const existing = _modelEntries.get(m.id);
      if (existing && existing.url === m.url) {
        existing.lat = m.lat;
        existing.lng = m.lng;
        existing.scale = m.scale;
        return;
      }
      if (existing) _disposeEntry(existing);
      const entry = { id: m.id, lat: m.lat, lng: m.lng, url: m.url, scale: m.scale, object: null };
      _modelEntries.set(m.id, entry);
      _loadEntry(entry);
    });
    map.triggerRepaint();
  } catch (e) {
    console.error("setModels error", e);
  }
};
