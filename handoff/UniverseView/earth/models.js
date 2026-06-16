/* ============================================================================
   earth/models.js — Tripo 生成 GLB を MapLibre globe 上に 3D 配置する custom layer
   本体 assets/web/earth/models.js を Claude Design 版エンジン用に適合（`map` を
   window.EarthMap.map から取得 / dlog を no-op 化）。それ以外のロジック（globe
   projection の anchor 行列・meshopt 対応・差分適用）は本体と同一。

   公開 API:
     window.setModels({ models: [{ id, lat, lng, url, scale? }] })   scale=実寸(m)
   ========================================================================== */
(function () {
  const map = window.EarthMap.map;     // 本体は global の map。ここは IIFE 公開オブジェクトから取得。
  const dlog = function () {};         // 本体は bridge の debug ログ。specimen は no-op。

  const MODELS_LAYER_ID = "tripo-models";
  const DEFAULT_SCALE_M = 400;

  const _modelEntries = new Map();     // id -> { lat, lng, url, scale, object|null }

  const _modelScene = new THREE.Scene();
  _modelScene.add(new THREE.AmbientLight(0xffffff, 0.95));
  const _modelDirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  _modelDirLight.position.set(0, -70, 100).normalize();
  _modelScene.add(_modelDirLight);
  const _modelCamera = new THREE.Camera();
  const _modelLoader = new THREE.GLTFLoader();
  if (window.MeshoptDecoder) _modelLoader.setMeshoptDecoder(MeshoptDecoder); // meshopt 圧縮 GLB

  let _modelRenderer = null;
  let _layerAdded = false;
  let _pendingModels = [];
  let _pendingScheduled = false;

  // MapLibre v5: custom layer の render 第2引数は matrix 配列でなくオブジェクト
  // (Float64Array を内包)。globe projection でも defaultProjectionData.mainMatrix に MVP。
  function _extractMatrix(arg) {
    if (Array.isArray(arg)) return arg;
    if (arg && arg.defaultProjectionData && arg.defaultProjectionData.mainMatrix) {
      return arg.defaultProjectionData.mainMatrix;
    }
    return arg;
  }

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
        // heading (yaw about the model's vertical axis, radians). Without this every
        // GLB inherits one world orientation and they all face the same way.
        if (typeof entry.heading === "number") obj.rotation.y = entry.heading;
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
      Array.from(_modelEntries.keys()).forEach((id) => {
        if (!nextIds.has(id)) {
          _disposeEntry(_modelEntries.get(id));
          _modelEntries.delete(id);
        }
      });
      models.forEach((m) => {
        if (!m || !m.id || !m.url || typeof m.lat !== "number" || typeof m.lng !== "number") return;
        const existing = _modelEntries.get(m.id);
        if (existing && existing.url === m.url) {
          existing.lat = m.lat;
          existing.lng = m.lng;
          existing.scale = m.scale;
          existing.heading = m.heading;
          if (existing.object && typeof m.heading === "number") existing.object.rotation.y = m.heading;
          return;
        }
        if (existing) _disposeEntry(existing);
        const entry = { id: m.id, lat: m.lat, lng: m.lng, url: m.url, scale: m.scale, heading: m.heading, object: null };
        _modelEntries.set(m.id, entry);
        _loadEntry(entry);
      });
      map.triggerRepaint();
    } catch (e) {
      console.error("setModels error", e);
    }
  };
})();
