// GumPackage 入稿 PDF ジェネレータ。
// GumPackageSpread.dc.html を headless Chrome で描画し、確定した 4 面
// (JA-表 / JA-裏 / EN-表 / EN-裏) の DOM をそのまま抜き出して面付けする。
// 級数・位置・文言は dc 側が唯一の正。ここでは一切書き換えない。
//
// usage:
//   cd lib-design && python3 -m http.server 8791 &
//   node handoff/GumPackage/make-pdf.mjs
//
// 出力 (handoff/GumPackage/pdf/):
//   GumPackage-ja-69x52.pdf / -en-  … 単票 2 ページ (p1 表 / p2 裏)。
//     ページ 75x58mm = 仕上がり 69x52mm + 塗り足し 3mm。TrimBox / BleedBox 埋め込み済み。
//   GumPackage-ja-A3.pdf / -en-     … A3 (297x420mm) 両面 2 ページ。4 列 x 7 行 = 28 面。
//     p2 は列順を左右反転してあるので、長辺とじ (縦軸反転) の両面印刷で表裏が一致する。
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'pdf');
const BUILD = join(HERE, '.build');
const BASE = 'http://localhost:8791/handoff/GumPackage/';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9334;

const MM2PT = 72 / 25.4;
const MM2IN = 1 / 25.4;

const GRAIN = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDAiIGhlaWdodD0iMTQwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBudW1PY3RhdmVzPSIzIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjE0MCIgaGVpZ2h0PSIxNDAiIGZpbHRlcj0idXJsKCNuKSIgb3BhY2l0eT0iMC41NSIvPjwvc3ZnPg==")';

// 仕上がり / 塗り足し。dc 側 artboard は 75x58mm で、trim 原点は art の +3mm。
const TW = 69, TH = 52, BL = 3;

/* ---------- CDP ---------- */
async function alive() {
  try { return (await fetch(`http://localhost:${PORT}/json/version`)).ok; } catch { return false; }
}
async function ensureChrome() {
  if (await alive()) return;
  spawn(CHROME, [`--remote-debugging-port=${PORT}`, '--headless=new', '--disable-gpu-sandbox',
    '--no-first-run', '--window-size=1600,1200', '--user-data-dir=/tmp/dcshot-profile'],
    { detached: true, stdio: 'ignore' }).unref();
  for (let i = 0; i < 60; i++) { await new Promise(r => setTimeout(r, 200)); if (await alive()) return; }
  throw new Error('chrome not up');
}
async function withPage(url, fn) {
  const tab = await (await fetch(`http://localhost:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let mid = 0; const pend = new Map();
  const send = (m, p = {}) => new Promise(r => { const id = ++mid; pend.set(id, r); ws.send(JSON.stringify({ id, method: m, params: p })); });
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
    else if (m.method === 'Runtime.exceptionThrown') console.log('[ex]', (m.params.exceptionDetails.exception?.description || '').slice(0, 200));
    else if (m.method === 'Network.loadingFailed') console.log('[netfail]', m.params.errorText);
  };
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  try { return await fn(send); }
  finally { try { await fetch(`http://localhost:${PORT}/json/close/${tab.id}`); } catch {} ws.close(); }
}

/* ---------- 確定 4 面を dc から抜く ---------- */
async function grabFaces() {
  return withPage(BASE + 'GumPackageSpread.dc.html', async send => {
    await new Promise(r => setTimeout(r, 9000));
    const r = await send('Runtime.evaluate', {
      expression: `JSON.stringify([...document.querySelectorAll('[data-artboard]')].map(e=>({label:e.getAttribute('data-screen-label'),html:e.outerHTML})))`,
      returnByValue: true,
    });
    const v = r.result?.result?.value;
    if (!v) throw new Error('artboard extract failed');
    const m = {};
    for (const a of JSON.parse(v)) m[a.label] = a.html;
    for (const k of ['JA-表', 'JA-裏', 'EN-表', 'EN-裏']) if (!m[k]) throw new Error('missing ' + k);
    return m;
  });
}

/* ---------- 背景を 1 枚に焼く ----------
   グラデ + grain(mix-blend-mode:overlay) は Chrome が必ずラスタライズする。面ごとに持たせると
   A3 28 面で 89MB になるので、600dpi の PNG 1 枚に焼いて全面で使い回す。文字はベクタのまま。 */
const DPI = 600, CSSPX = 96 / 25.4;
async function bakeBg() {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><base href="${BASE}">
<style>@import url('../../DesignSystem/colors_and_type.css');
:root{ --grain:${GRAIN}; }
html,body{margin:0;padding:0;background:#005f67;}
#a{position:relative;width:75mm;height:58mm;overflow:hidden;background:#005f67;}
</style></head><body><div id="a">
<div style="position:absolute;left:-12.5mm;top:-21mm;width:100mm;height:100mm;background:var(--gradient-colorful);"></div>
<div style="position:absolute;inset:0;background-image:var(--grain);background-size:35mm 35mm;opacity:.16;mix-blend-mode:overlay;"></div>
</div></body></html>`;
  writeFileSync(join(BUILD, 'bg.html'), html);
  return withPage(BASE + '.build/bg.html', async send => {
    await send('Emulation.setDeviceMetricsOverride', { width: 400, height: 300, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 2500));
    const r = await send('Page.captureScreenshot', {
      format: 'png', captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: 75 * CSSPX, height: 58 * CSSPX, scale: DPI / 96 },
    });
    const data = r.result?.result?.data ?? r.result?.data;
    if (!data) throw new Error('bg capture failed');
    writeFileSync(join(BUILD, 'bg.png'), Buffer.from(data, 'base64'));
    return Buffer.from(data, 'base64').length;
  });
}
// ぼかし付き text-shadow は Chrome が PDF 側で透明グループ + SMask にする。CoreGraphics
// (プレビュー / Quick Look) はこれを不透明な矩形で塗りつぶすため、文字の裏に黒帯が出る。
// オフセットは残したままぼかし半径だけ 0 にすると単なる二度描きになり、どの RIP でも同じに出る。
function printSafeShadow(art) {
  return art.replace(/text-shadow:\s*(rgba?\([^)]*\))\s+([\d.]+px)\s+([\d.]+mm)\s+[\d.]+mm/g,
    'text-shadow: $1 $2 $3 0px');
}
// artboard 内の「グラデ div」「grain div」を焼いた 1 枚に差し替える。
function useBakedBg(art) {
  const before = art.length;
  const out = art
    .replace(/<div[^>]*background:\s*var\(--gradient-colorful\);[^>]*><\/div>/, '')
    .replace(/<div[^>]*var\(--grain\)[^>]*><\/div>/, '')
    .replace(/>/, `><img src=".build/bg.png" style="position:absolute;left:0;top:0;width:${FW_PX}px;height:${FH_PX}px;">`);
  if (out.length >= before) throw new Error('bg swap failed');
  return out;
}

/* ---------- 面付け ---------- */
// Blink はレイアウトボックスの位置と寸法を整数 CSS px (0.2646mm) に丸める。75mm 指定は 283px
// = 74.877mm になり、ちょうど 75mm で切り出すと右下に 0.12mm の白が出る。artboard の箱と
// 背景だけ px 単位で切り上げておき、外側を PDF の箱で正確に切る。
const FW_PX = 284, FH_PX = 220; // 75mm=283.46px / 58mm=219.21px

function face(art, left, top) {
  const gt = art.indexOf('>');
  return `<div data-face="1" style="position:absolute;left:${left};top:${top};`
    + `width:${FW_PX}px;height:${FH_PX}px;overflow:hidden;background:#005f67;">` + art.slice(gt + 1);
}
// 1 面を trim 枠でクリップして置く (A3 面付け用)。grid の外周に面する辺だけ塗り足し 3mm を出す。
function tile(art, x, y, e) {
  const [eL, eT, eR, eB] = e;
  return `<div style="position:absolute;left:${x - eL}mm;top:${y - eT}mm;`
    + `width:${TW + eL + eR}mm;height:${TH + eT + eB}mm;overflow:hidden;">`
    + face(art, `${-(BL - eL)}mm`, `${-(BL - eT)}mm`) + `</div>`;
}

// Chrome は printToPDF のページサイズを 1/300 inch に量子化するため、要求した 75x58mm は
// 75.10x57.83mm で出てきて下端の塗り足しが 0.09mm 切れる。M mm の捨て代を付けて刷り、
// 出来上がった PDF の箱 (MediaBox / TrimBox) を後から正確な位置に切り直す。
// content stream は `.24 0 0 -.24 0 <TOP> cm` + `3.125 ...` = CSS px と 1:1 で MediaBox 左上原点。
// つまり CSS の (x,y)mm は PDF の (x*MM2PT, TOP - y*MM2PT) に必ず落ちる。
const M = 2;
const ORG_PX = 8;                       // 版面原点。整数 px にして丸めを起こさせない
const ORG = ORG_PX * 25.4 / 96;         // = 2.1167mm
function shell(pages, pw, ph) {
  const [W, H] = [pw + M * 2, ph + M * 2];
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><base href="${BASE}">
<style>
@import url('../../DesignSystem/colors_and_type.css');
:root{ --grain:${GRAIN}; }
@page{ size:${W}mm ${H}mm; margin:0; }
html,body{margin:0;padding:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.page{position:relative;width:${W}mm;height:${H}mm;overflow:hidden;break-after:page;}
.page:last-child{break-after:auto;}
.art{position:absolute;left:${ORG_PX}px;top:${ORG_PX}px;width:${pw}mm;height:${ph}mm;}
.mark{position:absolute;background:#000;}
</style></head><body>${pages}</body></html>`;
}

// 単票: 75x58mm x 2 ページ (表 / 裏)。全面塗り足しを出す。
// 単票は 1 面だけなのでクリップ枠を挟まず artboard を直接置く (塗り足しは全周そのまま出る)。
function singleDoc(front, back) {
  const pg = art => `<div class="page"><div class="art">${face(art, '0', '0')}</div></div>`;
  return shell(pg(front) + pg(back), TW + BL * 2, TH + BL * 2);
}

// A3: 4 列 x 7 行 = 28 面。列間・行間ゼロ (共通断裁)。外周のみ塗り足し 3mm。
const A3W = 297, A3H = 420, COLS = 4, ROWS = 7;
const GX = (A3W - COLS * TW) / 2, GY = (A3H - ROWS * TH) / 2;

function marks() {
  let s = '';
  const t = 0.12; // hairline mm
  for (let j = 0; j <= COLS; j++) {
    const x = GX + j * TW;
    s += `<div class="mark" style="left:${x - t / 2}mm;top:19mm;width:${t}mm;height:4mm;"></div>`;
    s += `<div class="mark" style="left:${x - t / 2}mm;top:${GY + ROWS * TH + 5}mm;width:${t}mm;height:4mm;"></div>`;
  }
  for (let i = 0; i <= ROWS; i++) {
    const y = GY + i * TH;
    s += `<div class="mark" style="left:3mm;top:${y - t / 2}mm;width:3.5mm;height:${t}mm;"></div>`;
    s += `<div class="mark" style="left:${A3W - 6.5}mm;top:${y - t / 2}mm;width:3.5mm;height:${t}mm;"></div>`;
  }
  return s;
}

function a3Page(art, mirror, label) {
  let s = '';
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const col = mirror ? COLS - 1 - j : j;
      s += tile(art, GX + col * TW, GY + i * TH,
        [col === 0 ? BL : 0, i === 0 ? BL : 0, col === COLS - 1 ? BL : 0, i === ROWS - 1 ? BL : 0]);
    }
  }
  s += marks();
  s += `<div style="position:absolute;left:0;top:9mm;width:${A3W}mm;text-align:center;font-family:var(--font-latin);font-size:2.6mm;letter-spacing:.08em;color:#444;">${label}</div>`;
  return `<div class="page"><div class="art">${s}</div></div>`;
}

function a3Doc(front, back, lang) {
  const head = `TOOPDBQ GUM SLEEVE / ${lang} / 69x52mm x 28 / A3 duplex, flip on LONG EDGE`;
  return shell(a3Page(front, false, head + ' &mdash; FRONT') + a3Page(back, true, head + ' &mdash; BACK (mirrored)'), A3W, A3H);
}

/* ---------- printToPDF ---------- */
async function toPdf(file, wmm, hmm, out) {
  [wmm, hmm] = [wmm + M * 2, hmm + M * 2];
  return withPage(BASE + '.build/' + file, async send => {
    await new Promise(r => setTimeout(r, 6000));
    await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
    await new Promise(r => setTimeout(r, 1500));
    const r = await send('Page.printToPDF', {
      paperWidth: wmm * MM2IN, paperHeight: hmm * MM2IN,
      marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
      printBackground: true, preferCSSPageSize: true, scale: 1,
    });
    const data = r.result?.result?.data ?? r.result?.data;
    if (!data) throw new Error('printToPDF failed: ' + JSON.stringify(r).slice(0, 300));
    writeFileSync(out, Buffer.from(data, 'base64'));
    return out;
  });
}

/* ---------- 箱を正確な位置に切り直す (増分更新で追記) ----------
   art は CSS 上で (ORG, ORG)mm から pw x ph mm。TOP = Chrome が出した MediaBox の高さ(pt)。 */
function setBoxes(path, pw, ph, trimInset) {
  let buf = readFileSync(path);
  const s = buf.toString('latin1');
  const prev = /startxref\s+(\d+)\s+%%EOF\s*$/.exec(s);
  const root = [...s.matchAll(/\/Root\s+(\d+)\s+(\d+)\s+R/g)].pop();
  const size = [...s.matchAll(/\/Size\s+(\d+)/g)].pop();
  if (!prev || !root || !size) throw new Error('trailer parse failed: ' + path);

  const objs = [];
  for (const m of s.matchAll(/\/Type\s*\/Page(?![sA-Za-z])/g)) {
    const head = s.lastIndexOf(' obj', m.index);
    const numM = /(\d+)\s+(\d+)\s+obj$/.exec(s.slice(Math.max(0, head - 24), head + 4));
    if (!numM) continue;
    const open = s.indexOf('<<', head);
    let depth = 0, i = open, end = -1;
    while (i < s.length) {
      if (s.startsWith('<<', i)) { depth++; i += 2; }
      else if (s.startsWith('>>', i)) { depth--; i += 2; if (!depth) { end = i; break; } }
      else i++;
    }
    if (end < 0) throw new Error('dict scan failed');
    let body = s.slice(open, end);
    if (/\/TrimBox|\/CropBox/.test(body)) continue;
    const mb = /\/MediaBox\s*\[([^\]]*)\]/.exec(body);
    if (!mb) throw new Error('no MediaBox');
    const TOP = +mb[1].trim().split(/\s+/)[3];
    const box = (x, y, w, h) => '[' + [x * MM2PT, TOP - (y + h) * MM2PT, (x + w) * MM2PT, TOP - y * MM2PT]
      .map(v => v.toFixed(4)).join(' ') + ']';
    const media = box(ORG, ORG, pw, ph);
    const trim = box(ORG + trimInset, ORG + trimInset, pw - trimInset * 2, ph - trimInset * 2);
    body = body.replace(/\/MediaBox\s*\[[^\]]*\]/, '');
    const add = `/MediaBox ${media} /CropBox ${media} /BleedBox ${media}`
      + (trimInset ? ` /TrimBox ${trim}` : '');
    objs.push({ num: +numM[1], gen: +numM[2], body: '<< ' + add + ' ' + body.slice(2) });
  }
  if (!objs.length) throw new Error('no page objects: ' + path);

  const parts = [buf];
  if (!s.endsWith('\n')) parts.push(Buffer.from('\n', 'latin1'));
  let off = parts.reduce((n, b) => n + b.length, 0);
  const entries = [];
  for (const o of objs) {
    const chunk = Buffer.from(`${o.num} ${o.gen} obj\n${o.body}\nendobj\n`, 'latin1');
    entries.push({ num: o.num, gen: o.gen, off });
    parts.push(chunk); off += chunk.length;
  }
  const xrefOff = off;
  let x = 'xref\n0 1\n0000000000 65535 f \n';
  for (const e of entries) x += `${e.num} 1\n${String(e.off).padStart(10, '0')} ${String(e.gen).padStart(5, '0')} n \n`;
  x += `trailer\n<< /Size ${size[1]} /Root ${root[1]} ${root[2]} R /Prev ${prev[1]} >>\nstartxref\n${xrefOff}\n%%EOF\n`;
  parts.push(Buffer.from(x, 'latin1'));
  writeFileSync(path, Buffer.concat(parts));
  return objs.length;
}

/* ---------- run ---------- */
await ensureChrome();
mkdirSync(OUT, { recursive: true });
mkdirSync(BUILD, { recursive: true });
const raw = await grabFaces();
const bgBytes = await bakeBg();
console.log('bg.png', (bgBytes / 1024).toFixed(0) + 'KB', `${DPI}dpi`, Math.round(75 / 25.4 * DPI) + 'x' + Math.round(58 / 25.4 * DPI) + 'px');
const F = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, printSafeShadow(useBakedBg(v))]));
console.log('faces:', Object.keys(F).join(' '));

const jobs = [
  ['single-ja.html', singleDoc(F['JA-表'], F['JA-裏']), TW + BL * 2, TH + BL * 2, 'GumPackage-ja-69x52.pdf', BL],
  ['single-en.html', singleDoc(F['EN-表'], F['EN-裏']), TW + BL * 2, TH + BL * 2, 'GumPackage-en-69x52.pdf', BL],
  ['a3-ja.html', a3Doc(F['JA-表'], F['JA-裏'], 'JA'), A3W, A3H, 'GumPackage-ja-A3.pdf', 0],
  ['a3-en.html', a3Doc(F['EN-表'], F['EN-裏'], 'EN'), A3W, A3H, 'GumPackage-en-A3.pdf', 0],
];
for (const [file, html, w, h, out, inset] of jobs) {
  writeFileSync(join(BUILD, file), html);
  const p = join(OUT, out);
  await toPdf(file, w, h, p);
  const n = setBoxes(p, w, h, inset);
  console.log(out, (readFileSync(p).length / 1024).toFixed(0) + 'KB',
    `${w}x${h}mm`, inset ? `Trim ${w - inset * 2}x${h - inset * 2}mm` : '', `(${n}p)`);
}
process.exit(0);
