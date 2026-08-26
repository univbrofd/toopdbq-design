#!/usr/bin/env python3
"""69x52mm の面を A3 (297x420mm) に敷き詰めた両面シートを作る。

p1 = 表の面付け / p2 = 裏の面付け。A3 縦置きの長辺は左右の辺なので、
**長辺とじ（左右反転）** の両面印刷で表裏が合うよう、裏は列順を左右反転してある。

内側の面は隣と断裁線を共有する（同じ絵が並ぶので、断裁がずれても隣の絵の端が
入るだけで破綻しない）。塗り足しはグリッドの外周にだけ 3mm 出す。

  --up 28   横向き 4列x7行。余白 左右10.5 / 上下28mm。普通のプリンタで刷れる（既定）
  --up 30   縦向き 5列x6行。面を 90 度倒して最大数を取る。上下の余白が 0 になるので
            フチなし印刷（またはラクスル等の塗り足し入稿）が要る

usage: python3 make-a3-sheet.py <表画像> <裏画像> [--up 28|30] [--dpi 400] [-o out.pdf]
"""
import io, os, sys
from PIL import Image, ImageDraw

A3W, A3H = 297.0, 420.0
TW, TH, BL = 69.0, 52.0, 3.0
MM2PT = 72.0 / 25.4
AR = TW / TH
LAYOUT = {28: (4, 7, False), 30: (5, 6, True)}     # cols, rows, rotate

def trim_of(path):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    if w / h > AR: nw, nh = int(round(h * AR)), h; x0, y0 = (w - nw) // 2, 0
    else:          nw, nh = w, int(round(w / AR)); x0, y0 = 0, (h - nh) // 2
    return im.crop((x0, y0, x0 + nw, y0 + nh))

def sheet(trim, cols, rows, rot, dpi, mirror):
    px = dpi / 25.4
    fw, fh = (TH, TW) if rot else (TW, TH)          # 1 面の版面 (mm)
    gw, gh = fw * cols, fh * rows
    ox, oy = (A3W - gw) / 2, (A3H - gh) / 2
    cv = Image.new('RGB', (int(round(A3W*px)), int(round(A3H*px))), (255, 255, 255))
    face = trim.rotate(90, expand=True) if rot else trim
    face = face.resize((int(round(fw*px)), int(round(fh*px))), Image.LANCZOS)
    order = range(cols - 1, -1, -1) if mirror else range(cols)
    for r in range(rows):
        for i, c in enumerate(order):
            cv.paste(face, (int(round((ox + i*fw)*px)), int(round((oy + r*fh)*px))))
    # グリッド外周に塗り足し（端の 1px を引き伸ばす）
    gx0, gy0 = int(round(ox*px)), int(round(oy*px))
    gx1, gy1 = gx0 + int(round(gw*px)), gy0 + int(round(gh*px))
    b = int(round(BL*px))
    g = cv.crop((gx0, gy0, gx1, gy1)); GW, GH = g.size
    cv.paste(g.crop((0,0,1,GH)).resize((b,GH), Image.NEAREST), (gx0-b, gy0))
    cv.paste(g.crop((GW-1,0,GW,GH)).resize((b,GH), Image.NEAREST), (gx1, gy0))
    cv.paste(g.crop((0,0,GW,1)).resize((GW,b), Image.NEAREST), (gx0, gy0-b))
    cv.paste(g.crop((0,GH-1,GW,GH)).resize((GW,b), Image.NEAREST), (gx0, gy1))
    for (sx,sy,dx,dy) in ((0,0,gx0-b,gy0-b), (GW-1,0,gx1,gy0-b), (0,GH-1,gx0-b,gy1), (GW-1,GH-1,gx1,gy1)):
        cv.paste(g.crop((sx,sy,sx+1,sy+1)).resize((b,b), Image.NEAREST), (dx,dy))
    # トンボ（断裁位置。塗り足しの外側に 4mm の線）
    d = ImageDraw.Draw(cv); ln = int(round(4*px)); wd = max(1, int(round(0.25*px)))
    for c in range(cols + 1):
        x = int(round((ox + c*fw)*px))
        d.line([(x, gy0-b-ln), (x, gy0-b)], fill=(0,0,0), width=wd)
        d.line([(x, gy1+b), (x, gy1+b+ln)], fill=(0,0,0), width=wd)
    for r in range(rows + 1):
        y = int(round((oy + r*fh)*px))
        d.line([(gx0-b-ln, y), (gx0-b, y)], fill=(0,0,0), width=wd)
        d.line([(gx1+b, y), (gx1+b+ln, y)], fill=(0,0,0), width=wd)
    return cv

def jpeg(im, q=92):
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=q, subsampling=0, optimize=True)
    return buf.getvalue()

def write_pdf(out, pages):
    objs, page_objs, kids, nxt = {}, [], [], 3
    for _ in pages:
        kids.append(nxt); page_objs.append((nxt, nxt+1, nxt+2)); nxt += 3
    W, H = A3W*MM2PT, A3H*MM2PT
    objs[1] = b'<< /Type /Catalog /Pages 2 0 R >>'
    objs[2] = ('<< /Type /Pages /Kids [%s] /Count %d >>' % (' '.join('%d 0 R' % k for k in kids), len(pages))).encode()
    for (pg, img, cont), (jpg, w, h) in zip(page_objs, pages):
        objs[pg] = ('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 %.4f %.4f] /CropBox [0 0 %.4f %.4f] '
                    '/Resources << /XObject << /Im0 %d 0 R >> >> /Contents %d 0 R >>' % (W, H, W, H, img, cont)).encode()
        objs[img] = (('<< /Type /XObject /Subtype /Image /Width %d /Height %d /ColorSpace /DeviceRGB '
                      '/BitsPerComponent 8 /Filter /DCTDecode /Length %d >>\nstream\n' % (w, h, len(jpg))).encode()
                     + jpg + b'\nendstream')
        cs = ('q %.4f 0 0 %.4f 0 0 cm /Im0 Do Q' % (W, H)).encode()
        objs[cont] = ('<< /Length %d >>\nstream\n' % len(cs)).encode() + cs + b'\nendstream'
    buf = bytearray(b'%PDF-1.7\n%\xe2\xe3\xcf\xd3\n'); off = {}
    for k in sorted(objs):
        off[k] = len(buf); buf += ('%d 0 obj\n' % k).encode() + objs[k] + b'\nendobj\n'
    xref, mx = len(buf), max(objs) + 1
    buf += ('xref\n0 %d\n' % mx).encode() + b'0000000000 65535 f \n'
    for k in range(1, mx): buf += ('%010d 00000 n \n' % off.get(k, 0)).encode()
    buf += ('trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n' % (mx, xref)).encode()
    open(out, 'wb').write(buf); return len(buf)

if len(sys.argv) < 3: raise SystemExit(__doc__)
a = sys.argv[1:]
up  = int(a[a.index('--up')+1])  if '--up'  in a else 28
dpi = int(a[a.index('--dpi')+1]) if '--dpi' in a else 400
out = a[a.index('-o')+1] if '-o' in a else None
imgs = [x for x in a if not x.startswith('-') and x not in
        (str(up), str(dpi), out or '') and os.path.exists(x)][:2]
if len(imgs) < 2: raise SystemExit('表と裏の画像を 2 つ渡すこと')
cols, rows, rot = LAYOUT[up]
HERE = os.path.dirname(os.path.abspath(__file__))
out = out or os.path.join(HERE, 'pdf', 'GumPackage-A3-%dup.pdf' % up)

print('A3 297x420mm / %d 面 (%d列 x %d行%s) / %d dpi' % (up, cols, rows, '・90度回転' if rot else '', dpi))
pages = []
for label, path, mirror in (('表', imgs[0], False), ('裏', imgs[1], True)):
    t = trim_of(path)
    eff = t.width / TW * 25.4
    s = sheet(t, cols, rows, rot, dpi, mirror)
    j = jpeg(s)
    pages.append((j, s.width, s.height))
    print('  %s  素材 trim %.0f dpi -> 配置後の実効 %.0f dpi  シート %dx%dpx  jpeg %.2fMB%s'
          % (label, eff, min(eff, dpi), s.width, s.height, len(j)/1e6, '  (列順を左右反転)' if mirror else ''))
os.makedirs(os.path.dirname(out), exist_ok=True)
n = write_pdf(out, pages)
print('=> %s  %.2fMB  2 ページ' % (out, n/1e6))
print('   両面は【長辺とじ（左右反転）】。A3 縦置きの長辺は左右の辺なので、これで表裏が合う')
if up == 30: print('   !! 上下の塗り足しが A3 の端に接する。フチなし印刷か塗り足し入稿が要る')
