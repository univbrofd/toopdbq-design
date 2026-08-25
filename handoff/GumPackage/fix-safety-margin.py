#!/usr/bin/env python3
"""印刷保証線（仕上がりから 3mm 内側）に文字を収める 2 案を作る。

A: 法定表示帯だけ内側へ。帯の下地は帯自身の「文字が無い行」を伸ばして合成し、
   縮小した帯をその上に載せる。写真は全面のまま。
B: 版面全体を内側へ。外周は同じ写真を拡大＋ぼかして敷く。全要素が一度に内側に入る。
"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

TW, TH = 69.0, 52.0
SAFE = 3.5
AR = TW / TH

def trim(path):
    im = Image.open(path).convert('RGB'); w, h = im.size
    if w/h > AR: nw = int(round(h*AR)); nh = h; x0 = (w-nw)//2; y0 = 0
    else:        nw = w; nh = int(round(w/AR)); x0 = 0; y0 = (h-nh)//2
    return im.crop((x0, y0, x0+nw, y0+nh))

def plan_a(t):
    nw, nh = t.size; px = nw/TW
    a = np.asarray(t).astype(int); ink = (a.min(axis=2) >= 200)
    ys, xs = np.nonzero(ink[int(nh*0.65):, :])
    ty0 = int(nh*0.65) + ys.min()
    top = max(0, ty0 - int(1.2*px))
    bh = nh - top
    # 下地バー: 帯の各列について「文字でない画素」の中央値 = 帯の地の色。
    # 単一行を伸ばすと縦縞が出るので、列ごとの中央値を横方向にならしてから縦に伸ばす。
    reg = a[top:nh, :, :]; msk = ~ink[top:nh, :]
    prof = np.zeros((1, nw, 3), dtype=np.uint8)
    for x in range(nw):
        col = reg[msk[:, x], x, :]
        prof[0, x] = np.median(col, axis=0) if len(col) else np.median(reg[:, x, :], axis=0)
    row = Image.fromarray(prof).resize((24, 1), Image.LANCZOS).resize((nw, 1), Image.BICUBIC)
    bar = row.resize((nw, bh), Image.NEAREST)
    o = t.copy()
    o.paste(bar, (0, top))
    s = (TW - 2*SAFE) / TW
    sw, sh = int(round(nw*s)), int(round(bh*s))
    sb = t.crop((0, top, nw, nh)).resize((sw, sh), Image.LANCZOS)
    ybot = nh - int(round(SAFE*px)); ytop = ybot - sh
    if ytop < top:                       # 縮小帯が下地より上にはみ出す分は下地も伸ばす
        o.paste(row.resize((nw, top-ytop), Image.NEAREST), (0, ytop))
    o.paste(sb, ((nw-sw)//2, ytop))
    return o

def plan_b(t):
    nw, nh = t.size; px = nw/TW
    bw, bh = int(round(75*px)), int(round(58*px))          # 塗り足し込み
    bg = t.resize((bw, bh), Image.LANCZOS).filter(ImageFilter.GaussianBlur(radius=px*1.6))
    bg = ImageEnhance.Brightness(bg).enhance(0.62)
    s = (TH - 2*SAFE) / TH                                  # 上下に SAFE を作る倍率
    iw, ih = int(round(nw*s)), int(round(nh*s))
    bg.paste(t.resize((iw, ih), Image.LANCZOS), ((bw-iw)//2, (bh-ih)//2))
    return bg, (75-69*s)/2, (58-52*s)/2                     # 塗り足し基準の余白 mm

def report(im, tag, bleed=False):
    nw, nh = im.size
    px = nw/(75.0 if bleed else TW)
    off = 3.0*px if bleed else 0
    a = np.asarray(im).astype(int); ink = (a.min(axis=2) >= 200)
    ys, xs = np.nonzero(ink[int(nh*0.62):, :])
    l = (xs.min()-off)/px; r = ((nw-off)-1-xs.max())/px; b = ((nh-off)-1-(int(nh*0.62)+ys.max()))/px
    print('   %-6s 法定表示: 左 %.2f / 右 %.2f / 下 %.2f mm' % (tag, l, r, b))

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.build', 'v6-src')
for lang in ('ja', 'en'):
    t = trim(os.path.join(SRC, '%s-front.jpg' % lang))
    print('== %s front' % lang.upper())
    a = plan_a(t); a.save(os.path.join(SRC, '%s-front-A.jpg' % lang), 'JPEG', quality=96, subsampling=0)
    report(a, 'A')
    b, mx, my = plan_b(t); b.save(os.path.join(SRC, '%s-front-B.jpg' % lang), 'JPEG', quality=96, subsampling=0)
    print('   B      版面を %.1f%% に縮小、余白 左右 %.2f / 上下 %.2f mm' % ((TH-2*SAFE)/TH*100, mx, my))
    report(b, 'B', bleed=True)
