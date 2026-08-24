#!/usr/bin/env python3
# 69x52mm trim + 3mm bleed = 75x58mm. 供給画像 = trim 領域の絵。
# trim にぴったり cover-crop し、塗り足しは端ピクセル引き伸ばしで作る（内容を1mmも切らない）。
import io, sys, os
from PIL import Image

TW, TH, BL = 69.0, 52.0, 3.0          # mm
MW, MH = TW + 2*BL, TH + 2*BL          # 75 x 58
AR = TW / TH
MM2PT = 72.0 / 25.4

def build_face(path):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    # cover-crop to 69:52
    if w / h > AR:                       # 横に長い -> 幅を削る
        nw = int(round(h * AR)); nh = h
        x0 = (w - nw) // 2; y0 = 0
    else:                                # 縦に長い -> 高さを削る
        nw = w; nh = int(round(w / AR))
        x0 = 0; y0 = (h - nh) // 2
    trim = im.crop((x0, y0, x0 + nw, y0 + nh))
    r = int(round(nw * BL / TW))         # 塗り足し ring (px)
    W, H = nw + 2*r, nh + 2*r
    cv = Image.new('RGB', (W, H))
    cv.paste(trim, (r, r))
    # 端ピクセルを引き伸ばして塗り足しを作る
    cv.paste(trim.crop((0, 0, 1, nh)).resize((r, nh), Image.NEAREST), (0, r))
    cv.paste(trim.crop((nw-1, 0, nw, nh)).resize((r, nh), Image.NEAREST), (r+nw, r))
    cv.paste(trim.crop((0, 0, nw, 1)).resize((nw, r), Image.NEAREST), (r, 0))
    cv.paste(trim.crop((0, nh-1, nw, nh)).resize((nw, r), Image.NEAREST), (r, r+nh))
    for (sx, sy, dx, dy) in ((0,0,0,0), (nw-1,0,r+nw,0), (0,nh-1,0,r+nh), (nw-1,nh-1,r+nw,r+nh)):
        cv.paste(trim.crop((sx, sy, sx+1, sy+1)).resize((r, r), Image.NEAREST), (dx, dy))
    buf = io.BytesIO()
    cv.save(buf, 'JPEG', quality=95, subsampling=0, optimize=True, dpi=(600, 600))
    return buf.getvalue(), W, H, nw / TW * 25.4   # dpi at trim

def write_pdf(out, faces):
    objs = {}
    n_pages = len(faces)
    pages_kids = []
    nxt = 3
    page_objs = []
    for i, (jpg, w, h, _) in enumerate(faces):
        pg, img, cont = nxt, nxt+1, nxt+2
        nxt += 3
        pages_kids.append(pg)
        page_objs.append((pg, img, cont, jpg, w, h))
    W, H = MW*MM2PT, MH*MM2PT
    t0, t1 = BL*MM2PT, BL*MM2PT
    t2, t3 = (BL+TW)*MM2PT, (BL+TH)*MM2PT
    objs[1] = b'<< /Type /Catalog /Pages 2 0 R >>'
    objs[2] = ('<< /Type /Pages /Kids [%s] /Count %d >>' %
               (' '.join('%d 0 R' % k for k in pages_kids), n_pages)).encode()
    for (pg, img, cont, jpg, w, h) in page_objs:
        objs[pg] = ('<< /Type /Page /Parent 2 0 R '
                    '/MediaBox [0 0 %.4f %.4f] /CropBox [0 0 %.4f %.4f] '
                    '/BleedBox [0 0 %.4f %.4f] /TrimBox [%.4f %.4f %.4f %.4f] '
                    '/Resources << /XObject << /Im0 %d 0 R >> >> /Contents %d 0 R >>'
                    % (W, H, W, H, W, H, t0, t1, t2, t3, img, cont)).encode()
        objs[img] = (('<< /Type /XObject /Subtype /Image /Width %d /Height %d '
                      '/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode '
                      '/Length %d >>\nstream\n' % (w, h, len(jpg))).encode()
                     + jpg + b'\nendstream')
        cs = ('q %.4f 0 0 %.4f 0 0 cm /Im0 Do Q' % (W, H)).encode()
        objs[cont] = ('<< /Length %d >>\nstream\n' % len(cs)).encode() + cs + b'\nendstream'
    buf = bytearray(b'%PDF-1.7\n%\xe2\xe3\xcf\xd3\n')
    off = {}
    for k in sorted(objs):
        off[k] = len(buf)
        buf += ('%d 0 obj\n' % k).encode() + objs[k] + b'\nendobj\n'
    xref = len(buf)
    mx = max(objs) + 1
    buf += ('xref\n0 %d\n' % mx).encode() + b'0000000000 65535 f \n'
    for k in range(1, mx):
        buf += ('%010d 00000 n \n' % off.get(k, 0)).encode()
    buf += ('trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n' % (mx, xref)).encode()
    open(out, 'wb').write(buf)
    return len(buf)

# 元画像は .build/v6-src/（gitignore・生成 AI の出力そのまま）
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.build', 'v6-src')
SETS = {
  'ja': [('表', 'ja-front.jpg'), ('裏', 'ja-back.png')],
  'en': [('表', 'en-front.jpg'), ('裏', 'en-back.png')],
}
outdir = sys.argv[1]
for lang, items in SETS.items():
    faces = []
    for label, fn in items:
        jpg, w, h, dpi = build_face(os.path.join(D, fn))
        faces.append((jpg, w, h, dpi))
        print('  %s-%s  %dx%dpx  trim %.0f dpi  jpeg %.2fMB  <- %s' %
              (lang, label, w, h, dpi, len(jpg)/1e6, fn))
    out = os.path.join(outdir, 'GumPackage-v6-%s-69x52.pdf' % lang)
    n = write_pdf(out, faces)
    print('=> %s  %.2fMB\n' % (out, n/1e6))
