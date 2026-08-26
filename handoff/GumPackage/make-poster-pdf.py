#!/usr/bin/env python3
"""画像 2 枚をそのまま両面 1 枚 (69x52mm) の入稿 PDF にする。

供給画像 = 仕上がり (trim) の絵。cover で塗り足しを作ると絵の端が断裁で落ちるので、
trim にぴったり収めてから塗り足し 3mm は端ピクセルの引き伸ばしで作る。
これなら画像内の要素は 1mm も切られない。

p1 = 表 / p2 = 裏。両ページとも正立で入れてあるので、横長 (69x52) の紙では
**短辺とじ (左右反転)** を指定すると表裏の天地が揃う。長辺とじだと裏が上下逆になる。

usage: python3 make-poster-pdf.py <表画像> <裏画像> [出力.pdf]
"""
import io, os, sys
from PIL import Image

TW, TH, BL = 69.0, 52.0, 3.0          # 仕上がり / 塗り足し
MW, MH = TW + 2*BL, TH + 2*BL          # 75 x 58
AR = TW / TH
MM2PT = 72.0 / 25.4
SAFE = 3.0

def build_face(path):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    if abs(w/h - MW/MH) < 0.008:                       # すでに塗り足し込み (75x58) の絵
        return jpeg(im), im.width, im.height, im.width / MW * 25.4, 0.0
    if w / h > AR:                                     # 横に長い -> 幅を削る
        nw, nh = int(round(h * AR)), h
        x0, y0 = (w - nw) // 2, 0
        cut = (w - nw) / 2 / (w / TW)                  # 片側で落ちる mm
    else:                                              # 縦に長い -> 高さを削る
        nw, nh = w, int(round(w / AR))
        x0, y0 = 0, (h - nh) // 2
        cut = (h - nh) / 2 / (h / TH)
    trim = im.crop((x0, y0, x0 + nw, y0 + nh))
    r = int(round(nw * BL / TW))                       # 塗り足しリング (px)
    W, H = nw + 2*r, nh + 2*r
    cv = Image.new('RGB', (W, H))
    cv.paste(trim, (r, r))
    cv.paste(trim.crop((0, 0, 1, nh)).resize((r, nh), Image.NEAREST), (0, r))
    cv.paste(trim.crop((nw-1, 0, nw, nh)).resize((r, nh), Image.NEAREST), (r+nw, r))
    cv.paste(trim.crop((0, 0, nw, 1)).resize((nw, r), Image.NEAREST), (r, 0))
    cv.paste(trim.crop((0, nh-1, nw, nh)).resize((nw, r), Image.NEAREST), (r, r+nh))
    for (sx, sy, dx, dy) in ((0,0,0,0), (nw-1,0,r+nw,0), (0,nh-1,0,r+nh), (nw-1,nh-1,r+nw,r+nh)):
        cv.paste(trim.crop((sx, sy, sx+1, sy+1)).resize((r, r), Image.NEAREST), (dx, dy))
    return jpeg(cv), W, H, nw / TW * 25.4, cut

def jpeg(im):
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=95, subsampling=0, optimize=True, dpi=(600, 600))
    return buf.getvalue()

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

if len(sys.argv) < 3:
    raise SystemExit(__doc__)
HERE = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[3] if len(sys.argv) > 3 else os.path.join(HERE, 'pdf', 'GumPackage-poster-69x52.pdf')
faces = []
for label, path in (('表', sys.argv[1]), ('裏', sys.argv[2])):
    if not os.path.exists(path):
        raise SystemExit('見つからない: ' + path)
    jpg, w, h, dpi, cut = build_face(path)
    faces.append((jpg, w, h))
    src = Image.open(path)
    note = '塗り足し込みの絵をそのまま使用' if cut == 0 else \
           ('69:52 に合わせて片側 %.2fmm を crop -> 塗り足しは端伸ばしで生成' % cut if cut > 0.005
            else '塗り足しは端伸ばしで生成')
    print('  %s  %dx%d px (%.3f)  -> trim %.0f dpi  jpeg %.2fMB  %s'
          % (label, src.width, src.height, src.width/src.height, dpi, len(jpg)/1e6, note))
    if dpi < 300:
        print('     !! trim 実効 %.0f dpi。印刷は 350dpi 以上が望ましい' % dpi)
os.makedirs(os.path.dirname(out), exist_ok=True)
n = write_pdf(out, faces)
print('=> %s  %.2fMB' % (out, n/1e6))
print('   page %gx%gmm / Trim %gx%gmm / 塗り足し %gmm / 2 ページ (p1 表・p2 裏)' % (MW, MH, TW, TH, BL))
print('   両面印刷は【短辺とじ（左右反転）】を指定すること。長辺とじだと裏が上下逆になる')
