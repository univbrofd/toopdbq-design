/* ============================================================================
   earth/look.js  —  the camera control panel (right rail)
   Only two things are tunable now: zoom and angle (pitch + bearing). Sliders
   drive the map live; values persist to localStorage so a tuned camera
   survives reload.
   ========================================================================== */
(function () {
  const LS_KEY = 'toopdbq.earthCamera.v5';
  // drop stale camera state saved by earlier versions (could restore a city zoom)
  try { ['v1','v2','v3','v4'].forEach(v => localStorage.removeItem('toopdbq.earthCamera.' + v)); } catch (e) {}

  const DEFAULTS = { zoom: 2.6, pitch: 0, bearing: 0 };

  let state = load();
  function load() {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(LS_KEY) || '{}')); }
    catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }

  // apply persisted camera to the map (once the map exists)
  function apply() {
    if (!window.EarthMap) return;
    window.EarthMap.setCamera(state);
  }

  // keep sliders in sync when the user drags / scrolls the map directly
  let els = {};
  function syncFromMap() {
    if (!window.EarthMap) return;
    const c = window.EarthMap.getCamera();
    state.zoom = c.zoom; state.pitch = c.pitch; state.bearing = c.bearing;
    save();
    setSlider('zoom', c.zoom);
    setSlider('pitch', c.pitch);
    setSlider('bearing', c.bearing);
  }
  function setSlider(key, v) {
    const e = els[key]; if (!e) return;
    e.input.value = v;
    e.val.textContent = fmt(v) + (e.unit || '');
  }

  function fmt(v) { return (Math.round(v * 10) / 10).toString(); }

  const SCHEMA = [
    { title: 'ズーム', id: 'zoom', controls: [
      { key: 'zoom', label: '距離', min: 1, max: 18, step: 0.1, setter: 'setZoom' },
    ]},
    { title: '角度', id: 'pitch / bearing', controls: [
      { key: 'pitch',   label: '傾き', min: 0,    max: 70,  step: 1, unit: '°', setter: 'setPitch' },
      { key: 'bearing', label: '回転', min: -180, max: 180, step: 1, unit: '°', setter: 'setBearing' },
    ]},
  ];

  function buildPanel() {
    const body = document.getElementById('panelBody');
    if (!body) return;
    body.innerHTML = '';
    els = {};

    SCHEMA.forEach(group => {
      const g = document.createElement('div'); g.className = 'group';
      const gt = document.createElement('div'); gt.className = 'gt';
      gt.innerHTML = `${group.title} <span class="id">${group.id}</span>`;
      g.appendChild(gt);

      group.controls.forEach(c => {
        const wrap = document.createElement('div'); wrap.className = 'ctrl';
        const lab = document.createElement('div'); lab.className = 'lab';
        const valEl = document.createElement('b');
        valEl.textContent = fmt(state[c.key]) + (c.unit || '');
        lab.innerHTML = `<span>${c.label}</span>`; lab.appendChild(valEl);
        const inp = document.createElement('input');
        inp.type = 'range'; inp.min = c.min; inp.max = c.max; inp.step = c.step;
        inp.value = state[c.key];
        inp.oninput = () => {
          const v = parseFloat(inp.value);
          valEl.textContent = fmt(v) + (c.unit || '');
          state[c.key] = v; save();
          if (window.EarthMap && window.EarthMap[c.setter]) window.EarthMap[c.setter](v);
        };
        els[c.key] = { input: inp, val: valEl, unit: c.unit || '' };
        wrap.appendChild(lab); wrap.appendChild(inp);
        g.appendChild(wrap);
      });
      body.appendChild(g);
    });

    const reset = document.createElement('button');
    reset.className = 'reset'; reset.textContent = '初期値に戻す';
    reset.onclick = () => {
      state = Object.assign({}, DEFAULTS); save(); apply(); buildPanel();
    };
    body.appendChild(reset);
  }

  window.EarthLook = { apply, buildPanel, syncFromMap, get: () => state };
})();
