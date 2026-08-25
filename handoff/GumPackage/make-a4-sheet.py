#!/usr/bin/env python3
# A4 (210x287mm portrait) に 69x52mm を 16 面 (4列x4行) 面付け。1面=52x69mm セル（絵を 90 度回転）。
# 両面: 長辺とじ（＝紙を縦軸で左右に裏返す）。グリッドは紙の中心に対して左右対称なので見当は自動で合う。
# 裏面の絵だけ表と逆向きに回す（表 90CCW / 裏 90CW）。切り出した札を「左右にめくる」自然な動作で裏が正立する。
#   held-frame の左右めくり = sheet-frame の上下反転 = 長辺とじの裏返し + 180 度。その 180 度を版で相殺する。
import io, os, sys
from PIL import Image

TW, TH = 69.0, 52.0                      # 1 面の仕上がり mm
PW, PH = 210.0, 297.0                    # A4 portrait
COLS, ROWS = 4, 4
CW, CH = TH, TW                          # セル = 52 x 69mm（絵を 90 度回転して入れる）
GX = (PW - COLS*CW) / 2                  # 1.0mm
GY = (PH - ROWS*CH) / 2                  # 10.5mm
MM = 72.0 / 25.4
AR = TW / TH

def trim_jpeg(path):
    im = Image.open(path).convert('RGB'); w, h = im.size
    if w / h > AR: nw = int(round(h*AR)); nh = h; x0 = (w-nw)//2; y0 = 0
    else:          nw = w; nh = int(round(w/AR)); x0 = 0; y0 = (h-nh)//2
    buf = io.BytesIO()
    im.crop((x0, y0, x0+nw, y0+nh)).save(buf, 'JPEG', quality=95, subsampling=0, optimize=True)
    return buf.getvalue(), nw, nh

def cells():
    for r in range(ROWS):
        for c in range(COLS):
            yield GX + c*CW, PH - GY - (r+1)*CH      # 左下 (mm)

def page_ops(ccw):
    """絵 TW x TH を 90 度回して セル CW x CH に置く cm 列。ccw=True で 90CCW。"""
    w, h = TW*MM, TH*MM
    out = []
    for X, Y in cells():
        x, y = X*MM, Y*MM
        if ccw: out.append('q %.4f %.4f %.4f %.4f %.4f %.4f cm /Im0 Do Q' % (0, w, -h, 0, x+h, y))
        else:   out.append('q %.4f %.4f %.4f %.4f %.4f %.4f cm /Im0 Do Q' % (0, -w, h, 0, x, y+w))
    return out

def marks():
    lw = 0.1*MM; t = 5.0*MM; g = []
    g.append('0 G %.4f w' % lw)
    for c in range(COLS+1):                                  # 縦の裁ち線 -> 上下余白へ
        x = (GX + c*CW)*MM
        g.append('%.4f %.4f m %.4f %.4f l S' % (x, (PH-GY)*MM, x, (PH-GY)*MM + t))
        g.append('%.4f %.4f m %.4f %.4f l S' % (x, GY*MM, x, GY*MM - t))
    for r in range(ROWS+1):                                  # 横の裁ち線 -> 左右余白へ（1mm しかない）
        y = (PH - GY - r*CH)*MM
        g.append('%.4f %.4f m %.4f %.4f l S' % (0, y, GX*MM, y))
        g.append('%.4f %.4f m %.4f %.4f l S' % ((PW-GX)*MM, y, PW*MM, y))
    return g

def label(txt):
    return ['BT /F1 5 Tf 0 g %.4f %.4f Td (%s) Tj ET' % (GX*MM, 3.2*MM, txt.replace('(', '').replace(')', ''))]

def write_pdf(out, pages):
    objs, nxt, kids, meta = {}, 4, [], []
    for _ in pages:
        kids.append(nxt); meta.append((nxt, nxt+1, nxt+2)); nxt += 3
    objs[1] = b'<< /Type /Catalog /Pages 2 0 R >>'
    objs[2] = ('<< /Type /Pages /Kids [%s] /Count %d >>' % (' '.join('%d 0 R' % k for k in kids), len(kids))).encode()
    objs[3] = b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
    for (pg, img, cont), (jpg, w, h, ops) in zip(meta, pages):
        objs[pg] = ('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 %.4f %.4f] '
                    '/Resources << /XObject << /Im0 %d 0 R >> /Font << /F1 3 0 R >> >> /Contents %d 0 R >>'
                    % (PW*MM, PH*MM, img, cont)).encode()
        objs[img] = (('<< /Type /XObject /Subtype /Image /Width %d /Height %d /ColorSpace /DeviceRGB '
                      '/BitsPerComponent 8 /Filter /DCTDecode /Length %d >>\nstream\n' % (w, h, len(jpg))).encode()
                     + jpg + b'\nendstream')
        cs = '\n'.join(ops).encode()
        objs[cont] = ('<< /Length %d >>\nstream\n' % len(cs)).encode() + cs + b'\nendstream'
    buf = bytearray(b'%PDF-1.7\n%\xe2\xe3\xcf\xd3\n'); off = {}
    for k in sorted(objs):
        off[k] = len(buf); buf += ('%d 0 obj\n' % k).encode() + objs[k] + b'\nendobj\n'
    xr = len(buf); mx = max(objs)+1
    buf += ('xref\n0 %d\n' % mx).encode() + b'0000000000 65535 f \n'
    for k in range(1, mx): buf += ('%010d 00000 n \n' % off.get(k, 0)).encode()
    buf += ('trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n' % (mx, xr)).encode()
    open(out, 'wb').write(buf); return len(buf)

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.build', 'v6-src')
outdir = sys.argv[1]
for lang, fs in (('ja', ('ja-front-A.jpg', 'ja-back.png')), ('en', ('en-front-A.jpg', 'en-back.png'))):
    pages = []
    for i, fn in enumerate(fs):
        jpg, w, h = trim_jpeg(os.path.join(SRC, fn))
        ops = ['q'] + page_ops(ccw=(i == 0)) + ['Q'] + marks() + label(
            'Toopdbq GumPackage v7 %s %s - 69x52mm 16up - duplex: LONG-EDGE binding - cut on marks'
            % (lang.upper(), 'FRONT' if i == 0 else 'BACK'))
        pages.append((jpg, w, h, ops))
        print('  %s %-5s %dx%dpx  %.0f dpi  jpeg %.2fMB' % (lang, 'front' if i == 0 else 'back', w, h, w/TW*25.4, len(jpg)/1e6))
    out = os.path.join(outdir, 'GumPackage-v7-%s-A4-16up.pdf' % lang)
    print('=> %s  %.2fMB   grid %dx%d  margin %.1f / %.1f mm\n' % (out, write_pdf(out, pages)/1e6, COLS, ROWS, GX, GY))
