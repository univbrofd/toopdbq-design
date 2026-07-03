/* ============================================================================
   earth/look.js  —  the GLOBE LOOK model
   Every tunable that defines how the globe *looks*. Values are written to CSS
   custom properties (read by Earth Globe.html) + a `presets` block (read by
   map-core.js). Persisted to localStorage so a tuned look survives reload.
   Refine here, then lift the values straight into your Flutter EarthView.
   ========================================================================== */
(function () {
  const LS_KEY = 'toopdbq.earthLook.v5';

  // -- DS-grounded option sets (colors_and_type.css role tokens) -------------
  const ATMO_COLORS = [
    { id: 'teal',   v: 'rgba(0,95,103,0.55)',   sw: '#005f67' },   // --grad-teal
    { id: 'golden', v: 'rgba(208,160,82,0.50)', sw: '#d0a052' },   // --grad-golden
    { id: 'pink',   v: 'rgba(255,62,136,0.42)', sw: '#ff3e88' },   // --state-like
    { id: 'white',  v: 'rgba(255,255,255,0.60)',sw: '#ffffff' },
    { id: 'none',   v: 'rgba(0,0,0,0)',         sw: 'none' },
  ];
  const MARKER_COLORS = [
    { id: 'blue',   v: '#2f7bff', sw: '#2f7bff' },   // location-dot convention
    { id: 'teal',   v: '#0a8d99', sw: '#0a8d99' },   // brand teal, lifted for dot
    { id: 'purple', v: '#8a38f5', sw: '#8a38f5' },   // --accent-purple
    { id: 'pink',   v: '#ff3e88', sw: '#ff3e88' },   // --state-like
  ];
  const SPACE_PRESETS = [
    // default: soft light blue-gray — a touch darker than the pale sphere so the
    // whole positron globe reads as a luminous disc (still high-key / airy).
    { id: 'mist',  sw: '#cdd6e1', core: '#e2e8f0', mid: '#cfd9e4', edge: '#b4c1d2' },
    { id: 'white', sw: '#eef3f8', core: '#ffffff', mid: '#f4f8fc', edge: '#e7eef6' }, // literal #bg-white — most blended
    { id: 'cool',  sw: '#aebed2', core: '#dbe4ef', mid: '#c2d0e0', edge: '#9fb1c8' },
    { id: 'deep',  sw: '#0b1020', core: '#1a2238', mid: '#0d1424', edge: '#05070e' }, // deep-space alt
  ];

  // -- DEFAULTS --------------------------------------------------------------
  const DEFAULTS = {
    space:    'mist',
    atmoColor:'white',
    atmoThickness: 14,   // px band width on the limb
    atmoBlur:      60,   // px softness outward
    atmoOpacity:   0.55, // 0..1 (multiplied by zoom fade)
    atmoSpread:    6,    // px the halo sits OUTSIDE the silhouette

    frameWidth:   2.4,   // px white edge line
    frameBlur:    1.9,   // px
    frameOpacity: 0.65,  // 0..1

    markerColor: 'blue',
    markerSize:  6,      // px dot diameter
    markerGlow:  0.4,    // 0..1

    // continuity (zoom / pitch / padding) ----------------------------------
    globeZoom:  1.4,
    regionZoom: 9,
    streetZoom: 14.0, // Flutter defaultInitialZoom=14 に一致 (street preset=初期 goPreset('street') の安定 zoom)
    streetPitch: 55,
    streetPadTop: 300,   // padding.top px → flattens the apparent tilt
  };

  let state = load();

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      return Object.assign({}, DEFAULTS, raw);
    } catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }

  // -- write the look into CSS vars ------------------------------------------
  function apply() {
    const r = document.documentElement.style;
    const sp = SPACE_PRESETS.find(s => s.id === state.space) || SPACE_PRESETS[0];
    r.setProperty('--space-core', sp.core);
    r.setProperty('--space-mid',  sp.mid);
    r.setProperty('--space-edge', sp.edge);

    const atmo = ATMO_COLORS.find(a => a.id === state.atmoColor) || ATMO_COLORS[0];
    r.setProperty('--atmo-color', atmo.v);
    r.setProperty('--atmo-thickness', state.atmoThickness + 'px');
    r.setProperty('--atmo-blur', state.atmoBlur + 'px');

    r.setProperty('--frame-width', state.frameWidth + 'px');
    r.setProperty('--frame-blur', state.frameBlur + 'px');
    r.setProperty('--frame-opacity', state.frameOpacity);

    const mk = MARKER_COLORS.find(m => m.id === state.markerColor) || MARKER_COLORS[0];
    r.setProperty('--marker-color', mk.v);
    r.setProperty('--marker-size', state.markerSize + 'px');
    r.setProperty('--marker-glow', state.markerGlow);

    if (window.EarthOverlay && window.EarthOverlay.refresh) window.EarthOverlay.refresh();
  }

  // -- expose ----------------------------------------------------------------
  window.EarthLook = {
    get: () => state,
    set(k, v) { state[k] = v; apply(); save(); },
    reset() { state = Object.assign({}, DEFAULTS); apply(); save(); buildPanel(); },
    apply,
    options: { ATMO_COLORS, MARKER_COLORS, SPACE_PRESETS },
    DEFAULTS,
  };

  // ==========================================================================
  // TUNING PANEL UI
  // ==========================================================================
  const SCHEMA = [
    { title: '宇宙背景', id: '#bg-white', controls: [
      { type: 'swatch', key: 'space', set: SPACE_PRESETS },
    ]},
    { title: '大気リング', id: '#strato-shadow', controls: [
      { type: 'swatch', key: 'atmoColor', set: ATMO_COLORS },
      { type: 'range', key: 'atmoThickness', label: '太さ',     min: 0,  max: 24, step: 1, unit: 'px' },
      { type: 'range', key: 'atmoBlur',      label: '滲み',     min: 0,  max: 60, step: 1, unit: 'px' },
      { type: 'range', key: 'atmoSpread',    label: '外側オフセット', min: 0, max: 80, step: 1, unit: 'px' },
      { type: 'range', key: 'atmoOpacity',   label: '濃度',     min: 0,  max: 1,  step: .05 },
    ]},
    { title: '球縁の白線', id: '#globe-frame', controls: [
      { type: 'range', key: 'frameWidth',   label: '太さ', min: 0, max: 5,  step: .1, unit: 'px' },
      { type: 'range', key: 'frameBlur',    label: '滲み', min: 0, max: 4,  step: .1, unit: 'px' },
      { type: 'range', key: 'frameOpacity', label: '濃度', min: 0, max: 1,  step: .05 },
    ]},
    { title: '中心マーカー', id: '青ドット + グロー', controls: [
      { type: 'swatch', key: 'markerColor', set: MARKER_COLORS },
      { type: 'range', key: 'markerSize', label: 'サイズ', min: 6, max: 24, step: 1, unit: 'px' },
      { type: 'range', key: 'markerGlow', label: 'グロー', min: 0, max: 1,  step: .05 },
    ]},
    { title: '連続性 (zoom / pitch / padding)', id: 'Globe ↔ Street', controls: [
      { type: 'range', key: 'globeZoom',   label: 'Globe zoom',   min: 0.5, max: 3,  step: .05, live: true },
      { type: 'range', key: 'regionZoom',  label: 'Region zoom',  min: 6,   max: 12, step: .1,  live: true },
      { type: 'range', key: 'streetZoom',  label: 'Street zoom',  min: 13,  max: 18, step: .1,  live: true },
      { type: 'range', key: 'streetPitch', label: 'Street pitch', min: 0,   max: 70, step: 1,   unit: '°', live: true },
      { type: 'range', key: 'streetPadTop',label: 'padding.top',  min: 0,   max: 460,step: 10,  unit: 'px',live: true },
    ]},
  ];

  function fmt(v) { return (Math.round(v * 100) / 100).toString(); }

  function buildPanel() {
    const body = document.getElementById('panelBody');
    if (!body) return;
    body.innerHTML = '';

    SCHEMA.forEach(group => {
      const g = document.createElement('div'); g.className = 'group';
      const gt = document.createElement('div'); gt.className = 'gt';
      gt.innerHTML = `${group.title} <span class="id">${group.id}</span>`;
      g.appendChild(gt);

      group.controls.forEach(c => {
        if (c.type === 'swatch') {
          const wrap = document.createElement('div'); wrap.className = 'ctrl';
          const row = document.createElement('div'); row.className = 'swatches';
          c.set.forEach(opt => {
            const b = document.createElement('button');
            if (opt.sw === 'none') { b.style.background = 'rgba(255,255,255,.04)'; b.innerHTML = '<span class="none">off</span>'; }
            else b.style.background = opt.sw;
            if (state[c.key] === opt.id) b.classList.add('sel');
            b.onclick = () => {
              window.EarthLook.set(c.key, opt.id);
              row.querySelectorAll('button').forEach(x => x.classList.remove('sel'));
              b.classList.add('sel');
            };
            row.appendChild(b);
          });
          wrap.appendChild(row);
          g.appendChild(wrap);
        } else if (c.type === 'range') {
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
            window.EarthLook.set(c.key, v);
            if (c.live && window.EarthMap && window.EarthMap.reapplyPreset) window.EarthMap.reapplyPreset();
          };
          wrap.appendChild(lab); wrap.appendChild(inp);
          g.appendChild(wrap);
        }
      });
      body.appendChild(g);
    });

    const reset = document.createElement('button');
    reset.className = 'reset'; reset.textContent = '初期値に戻す';
    reset.onclick = () => window.EarthLook.reset();
    body.appendChild(reset);

    const note = document.createElement('div');
    note.className = 'note';
    note.innerHTML = '\u30bf\u30a4\u30eb cell \u30af\u30e9\u30b9\u30bf\u30ea\u30f3\u30b0\u3068\u4ee3\u8868(repId)\u9023\u52d5\u306f <code>objects3d.js</code>\u3001\u30a8\u30f3\u30c6\u30a3\u30c6\u30a3\u306f <code>posts.js</code>\u3001\u30ea\u30fc\u30eb\u7d44\u307f\u7acb\u3066\u306f <code>Earth Globe.html</code> \u304c\u62c5\u3046\u3002\u3053\u306e\u30d1\u30cd\u30eb\u306f\u80cc\u666f\u30ec\u30a4\u30e4\u306e\u898b\u305f\u76ee\u3092\u8a70\u3081\u308b\u7528\u3002';
    body.appendChild(note);
  }

  window.EarthLook.buildPanel = buildPanel;
})();
