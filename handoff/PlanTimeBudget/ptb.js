/* PlanTimeBudget specimens — shared helpers.
   ?theme=dark|light (既定 = prefers-color-scheme) / ?mode=reopen（決め直し: 今の値入りで開く・裏を押すと閉じる）/ ?bare（gallery 用: 操作列なし） */
(function(){
  const P = new URLSearchParams(location.search);
  const root = document.documentElement;
  const mq = matchMedia('(prefers-color-scheme: light)');
  const applyTheme = () => { const t = P.get('theme'); root.dataset.theme = (t === 'light' || t === 'dark') ? t : (mq.matches ? 'light' : 'dark'); };
  applyTheme(); mq.addEventListener('change', applyTheme);

  const PTB = window.PTB = { P, reopen: P.get('mode') === 'reopen', bare: P.has('bare') };
  if (PTB.bare) root.classList.add('bare');
  PTB.embed = P.has('embed'); PTB.device = PTB.embed || P.has('device');
  if (PTB.device) {
    root.classList.add('device');
    const fit = () => root.style.setProperty('--k', Math.min(innerWidth / 402, innerHeight / 874));
    fit(); addEventListener('resize', fit);
    document.addEventListener('gesturestart', e => e.preventDefault()); // iOS のピンチ拡大を止める
  }
  const post = msg => parent !== window && parent.postMessage(Object.assign({ ptb: true }, msg), '*');

  /* ---- 時間帯 ---- 分: 6:00 = 360 … 翌6:00 = 1800 */
  PTB.MIN = 360; PTB.MAX = 1800; PTB.START_MAX = 1410; PTB.GAP = 60; PTB.STEP = 30;
  PTB.NOW = 14 * 60 + 12; // specimen の「今」= 14:12（as-built と同じ 14:30〜翌0:00 になる）
  PTB.fmt = m => { const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0'); return h >= 24 ? `翌${h - 24}:${mm}` : `${h}:${mm}`; };
  PTB.range = (s, e) => `${PTB.fmt(s)}〜${PTB.fmt(e)}`;
  PTB.dur = (s, e) => { const d = e - s, h = Math.floor(d / 60), m = d % 60; return (h ? `${h}時間` : '') + (m ? `${m}分` : ''); };
  PTB.initTime = (now = PTB.NOW) => {
    if (now < 360) return [360, 1440];
    const s = Math.min(Math.ceil(now / 30) * 30, PTB.START_MAX);
    return now >= 23 * 60 ? [s, 1800] : [s, 1440];
  };
  // 片方を動かしたとき、もう片方を押して最短 60 分を守る
  PTB.clampStart = (s, e) => { s = Math.max(PTB.MIN, Math.min(PTB.START_MAX, s)); if (e - s < PTB.GAP) e = Math.min(PTB.MAX, s + PTB.GAP); return [s, e]; };
  PTB.clampEnd = (s, e) => { e = Math.max(PTB.MIN + PTB.GAP, Math.min(PTB.MAX, e)); if (e - s < PTB.GAP) s = Math.max(PTB.MIN, e - PTB.GAP); return [s, e]; };
  PTB.snap = m => Math.round(m / PTB.STEP) * PTB.STEP;

  /* ---- 予算 ---- HANDOFF.md「段のデータ」A〜D（E = C のラーメンだけを選んだ場合の 2 行の端） */
  PTB.yen = n => '¥' + n.toLocaleString('en-US');
  PTB.TIER_NAMES = ['気軽に', 'ふつう', 'ちょっと贅沢', '贅沢']; // 20 / 40 / 60 / 80 パーセンタイル
  PTB.DATA = {
    A: { label: 'A デート × 気軽に', groups: [
      { k: 'dinner', name: '夜 イタリアン', short: '夜', per: '人', lim: [3000, 4000, 5000, 6000], cnt: [18, 36, 67, 81], total: 85 },
      { k: 'snack', name: 'カフェ', short: 'カフェ', per: '人', lim: [750, 1000, 1250, 1500], cnt: [59, 133, 229, 290], total: 319 } ] },
    B: { label: 'B 友達 4 人 × 遊ぶ', groups: [
      { k: 'dinner', name: '夜 焼肉', short: '焼肉', per: '人', lim: [5000, 6000, 6000, 7000], cnt: [41, 80, 80, 94], total: 113 },
      { k: 'bar', name: '夜の店 ビール', short: 'ビール', per: '人', lim: [2500, 3000, 3500, 4000], cnt: [12, 29, 37, 48], total: 50 } ] },
    C: { label: 'C 1 人 × 食べ歩き', groups: [
      { k: 'lunch', name: '昼 ラーメン', short: 'ラーメン', per: '人', lim: [1000, 1000, 1000], cnt: [79, 79, 79], total: 98 },
      { k: 'snack', name: 'カフェ スイーツ', short: 'スイーツ', per: '人', lim: [750, 1250, 1500], cnt: [18, 52, 74], total: 96 } ] },
    D: { label: 'D 古着 + カフェ', groups: [
      { k: 'wear', name: '服 古着', short: '古着', per: '点', lim: [8000, 12000, 16000, 30000], cnt: [97, 191, 255, 348], total: 418 },
      { k: 'snack', name: 'カフェ', short: 'カフェ', per: '人', lim: [750, 1000, 1250, 1500], cnt: [59, 133, 229, 290], total: 319 } ] },
    E: { label: 'E ラーメンだけ（2 行）', groups: [
      { k: 'lunch', name: '昼 ラーメン', short: 'ラーメン', per: '人', lim: [1000], cnt: [79], total: 98 } ] },
  };
  PTB.dataKey = () => (PTB.DATA[P.get('data')] ? P.get('data') : 'A');
  // 行 = 段 1〜4 + こだわらない。前の段と同じ額は same:true（薄く出す）
  PTB.tiers = d => {
    const n = Math.max(...d.groups.map(g => g.lim.length));
    const rows = [];
    for (let i = 0; i < n; i++) rows.push({ i, name: PTB.TIER_NAMES[i], any: false,
      cells: d.groups.map(g => ({ g, amt: g.lim[i], cnt: g.cnt[i], same: i > 0 && g.lim[i] === g.lim[i - 1] })),
      count: d.groups.reduce((a, g) => a + g.cnt[i], 0) });
    rows.push({ i: n, name: 'こだわらない', any: true, cells: d.groups.map(g => ({ g, amt: 0, cnt: g.total })), count: d.groups.reduce((a, g) => a + g.total, 0) });
    return rows;
  };
  PTB.budgets = row => Object.fromEntries(row.cells.map(c => [c.g.k, [0, row.any ? 0 : c.amt]]));
  PTB.defaultTier = rows => (rows.length > 2 ? 1 : 0);     // 「ふつう」
  PTB.reopenTier = rows => Math.min(2, rows.length - 2);  // specimen の「決め直し」で入っている値

  /* ---- 枠 ---- */
  const SB = `<div class="dynamic-island"></div><div class="statusbar"><span class="time">9:41</span><span class="sys">
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
    <svg width="26" height="12" viewBox="0 0 26 12" fill="none" stroke="currentColor"><rect x=".5" y=".5" width="22" height="11" rx="3" opacity=".4"/><rect x="2" y="2" width="19" height="8" rx="1.6" fill="currentColor" stroke="none"/></svg>
    </span></div><div class="home-ind"></div>`;
  const CORNERS = `<div class="corner c1 bub s52"><img class="ico" src="../../assets/icons/icon_search.png" alt=""></div>
    <div class="corner c2 bub s52"><svg width="18" height="22" viewBox="0 0 18 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M2 2h14v18l-7-5-7 5z"/></svg></div>`;

  PTB.out = t => { const o = document.getElementById('out'); if (o) o.textContent = t; };

  PTB.controls = (extra = []) => {
    if (PTB.bare) return;
    const el = document.getElementById('ctl'); if (!el) return;
    const link = (k, v) => { const q = new URLSearchParams(location.search); v == null ? q.delete(k) : q.set(k, v); return '?' + q.toString(); };
    const groups = [
      { k: 'theme', label: 'テーマ', opts: [[null, '自動'], ['dark', 'ダーク'], ['light', 'ライト']] },
      { k: 'mode', label: '開き方', opts: [[null, '最初'], ['reopen', '決め直し']] }, ...extra ];
    el.innerHTML = groups.map(g => `<div class="g"><span>${g.label}</span>${g.opts.map(([v, t]) =>
      `<a href="${link(g.k, v)}" class="${(P.get(g.k) || null) === v || (!P.get(g.k) && v === g.def) ? 'on' : ''}">${t}</a>`).join('')}</div>`).join('');
  };

  /* cfg: { emoji, get(), set(v), initial, reopenValue, answer(v) -> html } */
  PTB.mount = cfg => {
    const phone = document.getElementById('phone'), dlg = document.getElementById('dlg');
    phone.insertAdjacentHTML('beforeend', SB + CORNERS +
      `<div class="answer bub" id="answer"></div><div class="answer-cap">押すと決め直せます</div>`);
    const scrim = phone.querySelector('.scrim'), answer = document.getElementById('answer');
    const done = document.createElement('button'); done.className = 'done'; done.innerHTML = '<span>決定</span>';
    if (!cfg.noDone) dlg.appendChild(done); // noDone: 選んだ瞬間に決まる画面（予算）
    let mode = PTB.reopen ? 'reopen' : 'first';
    if (P.has('v')) { try { cfg.reopenValue = JSON.parse(P.get('v')); } catch (_) {} }
    let committed = PTB.reopen ? cfg.reopenValue : null;
    cfg.set(PTB.reopen ? cfg.reopenValue : cfg.initial);
    const commit = () => { committed = cfg.get(); answer.innerHTML = `<b>${cfg.emoji}</b>` + cfg.answer(committed);
      done.classList.add('pop');
      if (PTB.embed) { setTimeout(() => post({ type: 'done', value: committed, answer: cfg.answer(committed), emoji: cfg.emoji, out: (document.getElementById('out') || {}).textContent }), 220); return; }
      setTimeout(() => phone.classList.add('closed'), 220); }; // 弾けてから閉じる
    done.onclick = commit;
    scrim.onclick = () => {
      if (phone.classList.contains('closed')) return;
      if (mode === 'reopen' && PTB.embed) { post({ type: 'cancel' }); return; }
      if (mode === 'reopen') { cfg.set(committed); answer.innerHTML = `<b>${cfg.emoji}</b>` + cfg.answer(committed); phone.classList.add('closed'); }
      else { done.classList.remove('nudge'); void done.offsetWidth; done.classList.add('nudge'); } // 最初の設定は裏で閉じない
    };
    answer.onclick = () => { mode = 'reopen'; cfg.set(committed); done.classList.remove('pop'); phone.classList.remove('closed'); };
    return { commit };
  };

  /* pointer drag helper (DOM + pointer events — input[type=range] は使わない) */
  PTB.drag = (el, onMove, onEnd) => {
    el.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation(); el.setPointerCapture(e.pointerId); onMove(e, true);
      const mv = ev => onMove(ev, false);
      const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); onEnd && onEnd(); };
      el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });
  };
  // phone 内の座標（gallery の縮小表示でも正しく）
  PTB.local = (e, phone) => { const r = phone.getBoundingClientRect(), k = r.width / 402; return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k }; };
})();
