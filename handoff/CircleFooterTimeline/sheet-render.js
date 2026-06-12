/* sheet-render.js — CircleTimeline drag-sheet specimen renderer.
   v2 (design proposal — diverges from current Flutter impl):
     • circle avatar is FIXED size (no longer scales with sheet height)
     • circle header redesigned to read as place/circle context, not a post row
     • image carousel removed; timeline is a single feed of mixed text + image posts
   The fraction model + snap thresholds (CircleTimelineOverlay) are unchanged. */

const SCREEN_W = 393;
const SCREEN_H = 852;
const ICONS = '../assets/icons';

const FRAC = { collapsed: 0.25, middle: 0.5, full: 0.92 };

/* fixed header geometry (no longer height-driven) */
const HEADER_H = 64;
const C_AVATAR = 48;     // circle avatar — constant at every fraction
const TOP_PAD = 16, DIVIDER_H = 1, GAP_FEED = 14;
const COMPOSER_H = 96;  // bottom-docked composer (context chip + input bar)
const KB_H = 300;       // on-screen keyboard height (iOS portrait)
const ME_AVATAR = 'https://i.pravatar.cc/64?img=68';

const SAMPLE = {
  name: '渋谷コミュニティ',
  desc: '渋谷駅周辺のコミュニティ',
  members: '128人が参加',
  place: '渋谷',
  avatar: '../../assets/images/reel/reel00001.jpg',
  photo: '../../assets/images/reel/reel00004.jpg',
  /* mixed feed: text posts and image posts intermixed (Sample*Data.dart copy) */
  feed: [
    { type: 'image', nm: 'SunnyVi', av: 'https://i.pravatar.cc/64?img=5', tm: '2分前',
      img: '../../assets/images/reel/reel00004.jpg', tx: '渋谷の夕暮れ、最高でした。' },
    { type: 'text', nm: 'Kawaii', av: 'https://i.pravatar.cc/64?img=32', tm: '5分前', tx: 'ここはどこですか？気になります！' },
    { type: 'text', nm: 'Dreamy', av: 'https://i.pravatar.cc/64?img=12', tm: '12分前', tx: 'また行きたい場所です。' },
    { type: 'image', nm: 'foodie', av: 'https://i.pravatar.cc/64?img=48', tm: '20分前',
      img: '../../assets/images/reel/reel00001.jpg', tx: '近くの良いカフェ。' },
    { type: 'text', nm: 'Pixel', av: 'https://i.pravatar.cc/64?img=15', tm: '25分前', tx: 'いい雰囲気ですね。' },
    { type: 'text', nm: 'ZenGarden', av: 'https://i.pravatar.cc/64?img=23', tm: '31分前', tx: '静かで落ち着く場所。' },
  ],
};

function el(tag, cls, css) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (css) n.style.cssText = css;
  return n;
}
function img(src, css, cls) {
  const n = el('img', cls, css);
  n.src = src; n.loading = 'eager';
  n.onerror = () => { n.style.visibility = 'hidden'; };
  return n;
}
function icon(name, css) { return img(`${ICONS}/icon_${name}.png`, css); }

/* ---- layout solve (carousel removed; header fixed; composer bottom-docked) */
function solveLayout(fraction, hasForm, sheetHOverride) {
  const totalH = sheetHOverride != null ? sheetHOverride : SCREEN_H * fraction;
  const composerH = hasForm ? COMPOSER_H : 0;
  const bodyH = Math.max(0, totalH - composerH);
  const out = { totalH, bodyH, hasForm, headerH: HEADER_H, feedH: 0, render: 'full',
    topPad: TOP_PAD, dividerH: DIVIDER_H, gapFeed: GAP_FEED, composerH };
  if (bodyH < TOP_PAD + HEADER_H) { out.render = hasForm ? 'form-only' : 'none'; return out; }
  const feedH = Math.max(0, bodyH - TOP_PAD - HEADER_H - DIVIDER_H - GAP_FEED);
  out.feedH = feedH >= 40 ? feedH : 0;
  return out;
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ---- circle header: place/community identity, NOT a post row ------------- */
function buildHeader() {
  const row = el('div', null, `display:flex;align-items:center;height:${HEADER_H}px;padding:0 56px 0 16px;flex:none;`);
  // rounded-square photo (place metaphor) — distinct from round user avatars
  const av = el('div', null, `width:${C_AVATAR}px;height:${C_AVATAR}px;border-radius:14px;overflow:hidden;flex:none;background:#333;box-shadow:0 2px 8px rgba(0,0,0,.5);`);
  av.appendChild(img(SAMPLE.avatar, 'width:100%;height:100%;object-fit:cover;'));
  const col = el('div', null, 'display:flex;flex-direction:column;justify-content:center;min-width:0;margin-left:12px;gap:4px;');
  const nm = el('div', null, 'font-family:var(--font-jp);font-weight:700;font-size:18px;line-height:1.1;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;');
  nm.textContent = SAMPLE.name;
  // metadata row: group + member count · pin + place — circle-level info a post never has
  const meta = el('div', null, 'display:flex;align-items:center;gap:10px;min-width:0;');
  const m1 = el('span', null, 'display:inline-flex;align-items:center;gap:4px;font-family:var(--font-latin);font-weight:600;font-size:11px;color:var(--text-2);white-space:nowrap;');
  m1.append(icon('group', 'width:13px;height:13px;opacity:.85;'), document.createTextNode(SAMPLE.members));
  const dot = el('span', null, 'color:var(--text-3);font-size:11px;');
  dot.textContent = '·';
  const m2 = el('span', null, 'display:inline-flex;align-items:center;gap:4px;font-family:var(--font-latin);font-weight:600;font-size:11px;color:var(--text-2);white-space:nowrap;');
  m2.append(icon('pin_location', 'width:13px;height:13px;opacity:.85;'), document.createTextNode(SAMPLE.place));
  meta.append(m1, dot, m2);
  col.append(nm, meta);
  row.append(av, col);
  return row;
}

function buildDivider() {
  return el('div', null, `height:1px;flex:none;margin:14px 16px 0;background:linear-gradient(90deg, rgba(255,255,255,.04), rgba(255,255,255,.18) 50%, rgba(255,255,255,.04));`);
}

/* ---- mixed feed: text posts + image posts intermixed --------------------- */
function postHead(p) {
  const head = el('div', null, 'display:flex;align-items:center;gap:10px;');
  head.appendChild(img(p.av, 'width:32px;height:32px;border-radius:50%;object-fit:cover;flex:none;background:#333;'));
  const nm = el('span', null, 'font-family:var(--font-jp);font-weight:700;font-size:13px;color:#fff;');
  nm.textContent = p.nm;
  const tm = el('span', null, 'margin-left:auto;font-family:var(--font-latin);font-weight:400;font-size:10px;color:var(--text-3);');
  tm.textContent = p.tm;
  head.append(nm, tm);
  return head;
}
function buildPost(p) {
  if (p.type === 'image') {
    const post = el('div', null, 'display:flex;flex-direction:column;gap:8px;');
    post.appendChild(postHead(p));
    // portrait-only frame (縦向き写真のみ) — constrained width, 3:4 ratio, left-aligned
    const im = el('div', null, 'width:188px;aspect-ratio:3/4;border-radius:8px;overflow:hidden;background:#333;');
    im.appendChild(img(p.img, 'width:100%;height:100%;object-fit:cover;'));
    post.appendChild(im);
    if (p.tx) {
      const cap = el('div', null, 'font-family:var(--font-jp);font-weight:400;font-size:13px;line-height:1.4;color:var(--text-2);');
      cap.textContent = p.tx;
      post.appendChild(cap);
    }
    return post;
  }
  // text post — compact row
  const row = el('div', null, 'display:flex;gap:10px;align-items:flex-start;');
  row.appendChild(img(p.av, 'width:32px;height:32px;border-radius:50%;object-fit:cover;flex:none;background:#333;'));
  const col = el('div', null, 'min-width:0;');
  const top = el('div', null, 'display:flex;align-items:baseline;gap:8px;');
  const nm = el('span', null, 'font-family:var(--font-jp);font-weight:700;font-size:13px;color:#fff;');
  nm.textContent = p.nm;
  const tm = el('span', null, 'margin-left:auto;font-family:var(--font-latin);font-weight:400;font-size:10px;color:var(--text-3);');
  tm.textContent = p.tm;
  top.append(nm, tm);
  const tx = el('div', null, 'font-family:var(--font-jp);font-weight:400;font-size:13px;line-height:1.45;color:var(--text-2);margin-top:2px;');
  tx.textContent = p.tx;
  col.append(top, tx);
  row.appendChild(col);
  return row;
}
function buildFeed(L) {
  const box = el('div', null, `height:${L.feedH}px;overflow:hidden;-webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 4%,#000 96%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0%,#000 4%,#000 96%,transparent 100%);`);
  if (SAMPLE.feed.length === 0) {
    const empty = el('div', null, 'height:100%;display:flex;align-items:center;justify-content:center;font-family:var(--font-jp);font-size:14px;color:rgba(255,255,255,.5);');
    empty.textContent = '投稿がありません';
    box.appendChild(empty); return box;
  }
  const list = el('div', null, 'display:flex;flex-direction:column;gap:16px;padding:12px 16px 16px;');
  SAMPLE.feed.forEach(p => list.appendChild(buildPost(p)));
  box.appendChild(list);
  return box;
}

/* bottom-docked comment composer.
   o = { typed: string, active: bool } — typed shows entered text + caret;
   active (no text) shows placeholder + caret (field focused, keyboard up). */
function buildComposer(o) {
  o = o || {};
  const wrap = el('div', null, `height:${COMPOSER_H}px;flex:none;display:flex;flex-direction:column;background:rgba(0,0,0,.9);border-top:1px solid rgba(255,255,255,.12);`);
  // context chip — what you're replying to (the target post)
  const ctx = el('div', null, 'height:34px;flex:none;display:flex;align-items:center;gap:8px;padding:0 16px;background:rgba(255,255,255,.05);');
  ctx.append(icon('comment', 'width:13px;height:13px;opacity:.7;flex:none;'));
  const lbl = el('span', null, 'flex:1;min-width:0;font-family:var(--font-jp);font-size:11px;color:var(--text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;');
  lbl.innerHTML = '<b style="color:#fff;font-weight:700;">SunnyVi</b> さんの投稿に返信';
  const tmb = el('div', null, 'width:22px;height:22px;border-radius:5px;overflow:hidden;flex:none;background:#333;');
  tmb.appendChild(img(SAMPLE.feed[0].img, 'width:100%;height:100%;object-fit:cover;'));
  ctx.append(lbl, tmb);
  // input bar — avatar · field · send
  const bar = el('div', null, 'flex:1;display:flex;align-items:center;gap:10px;padding:0 12px;');
  const av = el('div', null, 'width:34px;height:34px;border-radius:50%;overflow:hidden;flex:none;background:#333;');
  av.appendChild(img(ME_AVATAR, 'width:100%;height:100%;object-fit:cover;'));
  const field = el('div', null, 'flex:1;min-width:0;height:42px;border-radius:99px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.15);display:flex;align-items:center;padding:0 16px;font-family:var(--font-jp);font-size:14px;white-space:nowrap;overflow:hidden;');
  const hasText = !!o.typed;
  if (hasText) {
    field.style.color = '#fff';
    const t = el('span', null, ''); t.textContent = o.typed; field.appendChild(t);
    field.appendChild(el('span', 'tl-caret'));
  } else {
    field.style.color = 'rgba(255,255,255,.45)';
    if (o.active) { field.appendChild(el('span', 'tl-caret')); const ph = el('span', null, 'margin-left:1px;'); ph.textContent = 'コメントを入力…'; field.appendChild(ph); }
    else { field.textContent = 'コメントを入力…'; }
  }
  const send = el('div', null, `width:42px;height:42px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;${hasText ? 'background:var(--primary);box-shadow:0 2px 12px rgba(208,160,82,.45);' : 'background:rgba(255,255,255,.1);'}`);
  send.appendChild(icon('next', `width:42%;height:42%;object-fit:contain;${hasText ? '' : 'opacity:.45;'}`));
  bar.append(av, field, send);
  wrap.append(ctx, bar);
  return wrap;
}

/* iOS-style on-screen keyboard (preview only) */
function buildKeyboard() {
  const kb = el('div', 'tl-keyboard', `position:absolute;left:0;right:0;bottom:0;z-index:5;height:${KB_H}px;display:flex;flex-direction:column;background:#2a2a2c;padding:8px 3px 0;`);
  // predictive candidate bar (Japanese conversion)
  const cand = el('div', null, 'height:38px;flex:none;display:flex;align-items:center;');
  ['コメント', '今', '件'].forEach((c, i) => {
    const w = el('div', null, `flex:1;text-align:center;font-family:var(--font-jp);font-size:14px;color:#fff;${i ? 'border-left:1px solid rgba(255,255,255,.12);' : ''}`);
    w.textContent = c; cand.appendChild(w);
  });
  kb.appendChild(cand);
  const rows = [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['shift','z','x','c','v','b','n','m','del'],
    ['123','かな','space','改行'],
  ];
  rows.forEach((row, ri) => {
    const r = el('div', null, `flex:1;display:flex;gap:6px;padding:5px ${ri === 1 ? 18 : 3}px;justify-content:center;`);
    row.forEach(k => {
      const special = ['shift','del','123','かな','space','改行'].includes(k);
      const flex = k === 'space' ? '5' : (special ? '1.5' : '1');
      const key = el('div', null, `flex:${flex};display:flex;align-items:center;justify-content:center;height:100%;border-radius:5px;background:${special ? 'rgba(120,120,124,.55)' : '#6c6c6e'};box-shadow:0 1px 0 rgba(0,0,0,.4);font-family:var(--font-jp);font-size:${special && k.length > 1 ? 12 : 17}px;color:#fff;`);
      key.textContent = (k === 'del' ? '⌫' : k === 'shift' ? '⇧' : k === 'space' ? '' : k);
      r.appendChild(key);
    });
    kb.appendChild(r);
  });
  // home indicator
  const hi = el('div', null, 'height:18px;flex:none;display:flex;align-items:center;justify-content:center;');
  hi.appendChild(el('div', null, 'width:120px;height:5px;border-radius:99px;background:rgba(255,255,255,.5);'));
  kb.appendChild(hi);
  return kb;
}

/* ---- whole phone --------------------------------------------------------- */
function buildPhone(opts) {
  const o = Object.assign({ fraction: FRAC.middle, hasForm: false, dismissing: false, showMapShare: false, keyboard: false, typed: '' }, opts);
  if (o.keyboard) o.hasForm = true;
  const isCollapsed = o.fraction <= FRAC.collapsed + 1e-6 && !o.dismissing;
  // when the keyboard is up the sheet docks above it and fills the rest of the screen
  const sheetHeight = o.keyboard ? (SCREEN_H - KB_H) : SCREEN_H * o.fraction;

  const phone = el('div', 'tl-phone');
  const bg = el('div', 'tl-bg');
  bg.appendChild(img(SAMPLE.photo, 'width:100%;height:100%;object-fit:cover;'));
  phone.appendChild(bg);

  if (!o.keyboard) {
    const tap = el('div', 'tl-tap', o.dismissing ? 'bottom:0;top:0;' : `bottom:${sheetHeight}px;`);
    tap.innerHTML = '<span>外タップで onDismiss</span>';
    phone.appendChild(tap);
  }

  if (o.showMapShare && o.fraction < FRAC.full - 0.02 && !o.dismissing) {
    const near = el('div', 'wd-icon-btn', `position:absolute;right:12px;bottom:${sheetHeight + 12}px;width:47px;height:47px;z-index:6;`);
    near.appendChild(icon('near', 'width:44%;height:44%;object-fit:contain;'));
    phone.appendChild(near);
  }

  const L = solveLayout(o.fraction, o.hasForm, o.keyboard ? sheetHeight : null);
  const sheet = el('div', 'tl-sheet', `height:${sheetHeight}px;bottom:${o.keyboard ? KB_H : 0}px;${o.dismissing ? 'transform:translateY(100%);opacity:.35;' : ''}`);
  const inner = el('div', null, 'position:absolute;inset:0;display:flex;flex-direction:column;');

  if (L.render === 'none') {
    // nothing
  } else if (L.render === 'form-only') {
    inner.appendChild(buildComposer({ typed: o.typed, active: o.keyboard }));
  } else {
    inner.appendChild(el('div', null, `height:${TOP_PAD}px;flex:none;`));
    inner.appendChild(buildHeader());
    inner.appendChild(buildDivider());
    if (L.feedH > 0) {
      inner.appendChild(el('div', null, `height:${GAP_FEED - 14}px;flex:none;`));
      inner.appendChild(buildFeed(L));
    }
    if (o.hasForm) inner.appendChild(buildComposer({ typed: o.typed, active: o.keyboard }));
  }
  sheet.appendChild(inner);

  if (o.keyboard) phone.appendChild(buildKeyboard());

  if (!isCollapsed && !o.dismissing && L.render === 'full') {
    const close = el('div', 'wd-icon-btn', 'position:absolute;top:12px;right:12px;width:44px;height:44px;z-index:4;');
    close.appendChild(icon('close', 'width:44%;height:44%;object-fit:contain;'));
    sheet.appendChild(close);
    if (!o.hasForm) {
      const edit = el('div', 'wd-icon-btn', 'position:absolute;bottom:36px;right:12px;width:44px;height:44px;z-index:4;');
      edit.appendChild(icon('edit', 'width:44%;height:44%;object-fit:contain;'));
      sheet.appendChild(edit);
    }
  }
  if (isCollapsed) {
    const hint = el('div', 'tl-collapsed-hint');
    hint.textContent = 'シート本体タップ → onHeaderTap';
    sheet.appendChild(hint);
  }
  phone.appendChild(sheet);
  return { phone, layout: L, sheetHeight };
}

function mountPhone(host, opts, scale) {
  const { phone, layout, sheetHeight } = buildPhone(opts);
  const box = el('div', 'tl-scalebox', `width:${SCREEN_W * scale}px;height:${SCREEN_H * scale}px;`);
  phone.style.transform = `scale(${scale})`;
  box.appendChild(phone);
  host.appendChild(box);
  return { layout, sheetHeight };
}

window.TLSheet = { buildPhone, mountPhone, solveLayout, buildKeyboard, FRAC, SCREEN_H, SCREEN_W, SAMPLE, HEADER_H, KB_H };
