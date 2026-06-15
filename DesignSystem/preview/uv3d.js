/* uv3d.js — Toopdbq UniverseView GLB mounter
 * Renders real .glb objects with warm "atelier" studio lighting on a transparent
 * background, so they sit directly on the map (no stick / ring / triangle).
 *
 * Robustness: the GLTF load callback is fetch-based and fires even when the tab is
 * hidden; we render ONE synchronous frame on load so a static posed model is always
 * visible (the canvas is its own poster). A rAF loop adds the slow turntable + drag
 * when the document is visible. Respects prefers-reduced-motion.
 *
 * Requires (global builds, load before this file):
 *   three.js r128, examples/js/loaders/GLTFLoader.js, examples/js/controls/OrbitControls.js
 *
 * API:  UV3D.mount(hostEl, { src, rotate=true, drag=false, exposure=1.15 }) -> handle
 *       handle.render()   force one frame
 *       handle.dispose()  free the context
 */
(function () {
  const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const live = [];

  function mount(host, opts) {
    opts = opts || {};
    const src = opts.src || host.dataset.src;
    const rotate = opts.rotate !== false && !REDUCED;
    const drag = !!opts.drag;
    const exposure = opts.exposure || 1.15;
    const speed = opts.rotateSpeed || 1.6;

    const w = host.clientWidth || 200, h = host.clientHeight || 260;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(w, h);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = exposure;
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:' + (drag ? 'none' : 'manipulation') + ';';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(32, w / h, 0.01, 1000);

    // atelier light rig: warm key, cool fill, warm rim — sculptural on dark
    const key = new THREE.DirectionalLight(0xffe6c4, 2.7); key.position.set(3, 4, 3); scene.add(key);
    const fill = new THREE.DirectionalLight(0xaecbe0, 0.8); fill.position.set(-3, 1, -2); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffd9a8, 0.9); rim.position.set(0, 2, -4); scene.add(rim);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const controls = new THREE.OrbitControls(cam, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = drag;
    controls.autoRotate = rotate;
    controls.autoRotateSpeed = speed;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    const handle = { renderer, scene, cam, controls, loaded: false, host };

    function frame() { controls.update(); renderer.render(scene, cam); }
    handle.render = frame;

    const loader = new THREE.GLTFLoader();
    loader.load(src, (g) => {
      const obj = g.scene;
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxd = Math.max(size.x, size.y, size.z) || 1;
      const s = 2 / maxd;
      obj.scale.setScalar(s);
      obj.position.set(-center.x * s, -center.y * s, -center.z * s);
      obj.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; if (o.material) o.material.envMapIntensity = 0.6; } });
      scene.add(obj);
      const fitH = 2 / (2 * Math.tan(Math.PI * cam.fov / 360));
      const dist = fitH * (opts.distance || 1.7);
      cam.position.set(0, 0.18, dist);
      controls.target.set(0, 0, 0);
      controls.update();
      handle.loaded = true;
      host.setAttribute('data-loaded', '1');
      frame(); // synchronous first frame — static poster, works even when hidden
      if (opts.onload) opts.onload(handle);
    }, undefined, (e) => { host.setAttribute('data-error', '1'); });

    live.push(handle);
    return handle;
  }

  // single shared rAF loop drives all live mounts when the document is visible
  function loop() {
    requestAnimationFrame(loop);
    if (document.hidden) return;
    for (const h of live) { if (h.loaded) { h.controls.update(); h.renderer.render(h.scene, h.cam); } }
  }
  requestAnimationFrame(loop);

  // when returning to the tab, paint one frame immediately
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) for (const h of live) { if (h.loaded) h.render(); }
  });

  window.UV3D = { mount, _live: live };
})();
