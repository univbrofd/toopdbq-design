#!/usr/bin/env python3
"""焼いた面 PNG から入稿 PDF を作る。

ネオン装飾（box-shadow / text-shadow の blur）を Chrome がベクタ PDF に出すと
透明グループ + SMask になり、CoreGraphics 系の RIP とプレビューが不透明な矩形で
塗り潰す。グローはこのデザインの本体なので blur を落とせない。よって面ごと
600dpi のラスタ（make-pdf.mjs の bakeFaces が .build/face-*.png に出す）にして、
それを 75x58mm のページへ等倍で貼り、TrimBox / BleedBox を埋める。

usage: python3 make-raster-pdf.py <tag>        # 例: en  -> .build/face-en-{0,1}.png
"""
import io, os, sys
from PIL import Image

TW, TH, BL = 69.0, 52.0, 3.0
MW, MH = TW + 2*BL, TH + 2*BL          # 75 x 58
MM2PT = 72.0 / 25.4
HERE = os.path.dirname(os.path.abspath(__file__))

def load(path):
    im = Image.open(path).convert('RGB')
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=94, subsampling=0, optimize=True, progressive=False)
    return buf.getvalue(), im.width, im.height

def write_pdf(out, faces):
    objs, page_objs, kids, nxt = {}, [], [], 3
    for _ in faces:
        kids.append(nxt); page_objs.append((nxt, nxt+1, nxt+2)); nxt += 3
    W, H = MW*MM2PT, MH*MM2PT
    t = (BL*MM2PT, BL*MM2PT, (BL+TW)*MM2PT, (BL+TH)*MM2PT)
    objs[1] = b'<< /Type /Catalog /Pages 2 0 R >>'
    objs[2] = ('<< /Type /Pages /Kids [%s] /Count %d >>'
               % (' '.join('%d 0 R' % k for k in kids), len(faces))).encode()
    for (pg, img, cont), (jpg, w, h) in zip(page_objs, faces):
        objs[pg] = ('<< /Type /Page /Parent 2 0 R '
                    '/MediaBox [0 0 %.4f %.4f] /CropBox [0 0 %.4f %.4f] '
                    '/BleedBox [0 0 %.4f %.4f] /TrimBox [%.4f %.4f %.4f %.4f] '
                    '/Resources << /XObject << /Im0 %d 0 R >> >> /Contents %d 0 R >>'
                    % (W, H, W, H, W, H, *t, img, cont)).encode()
        objs[img] = (('<< /Type /XObject /Subtype /Image /Width %d /Height %d '
                      '/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode '
                      '/Length %d >>\nstream\n' % (w, h, len(jpg))).encode() + jpg + b'\nendstream')
        cs = ('q %.4f 0 0 %.4f 0 0 cm /Im0 Do Q' % (W, H)).encode()
        objs[cont] = ('<< /Length %d >>\nstream\n' % len(cs)).encode() + cs + b'\nendstream'
    buf = bytearray(b'%PDF-1.7\n%\xe2\xe3\xcf\xd3\n')
    off = {}
    for k in sorted(objs):
        off[k] = len(buf); buf += ('%d 0 obj\n' % k).encode() + objs[k] + b'\nendobj\n'
    xref, mx = len(buf), max(objs) + 1
    buf += ('xref\n0 %d\n' % mx).encode() + b'0000000000 65535 f \n'
    for k in range(1, mx):
        buf += ('%010d 00000 n \n' % off.get(k, 0)).encode()
    buf += ('trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n' % (mx, xref)).encode()
    open(out, 'wb').write(buf)
    return len(buf)

tag = sys.argv[1] if len(sys.argv) > 1 else 'en'
ver = (os.environ.get('GUM_VER', '') + '-') if os.environ.get('GUM_VER') else ''
srcs = [os.path.join(HERE, '.build', 'face-%s-%d.png' % (tag, i)) for i in (0, 1)]
faces = []
for i, p in enumerate(srcs):
    if not os.path.exists(p):
        raise SystemExit('missing %s — 先に make-pdf.mjs を走らせること' % p)
    jpg, w, h = load(p)
    faces.append((jpg, w, h))
    print('  %s-%s  %dx%dpx  %.0f dpi (75mm 基準)  jpeg %.2fMB'
          % (tag, ('表', '裏')[i], w, h, w / MW * 25.4, len(jpg)/1e6))
out = os.path.join(HERE, 'pdf', 'GumPackage-%s%s-69x52-raster.pdf' % (ver, tag))
n = write_pdf(out, faces)
print('=> %s  %.2fMB  page %gx%gmm / Trim %gx%gmm' % (out, n/1e6, MW, MH, TW, TH))
