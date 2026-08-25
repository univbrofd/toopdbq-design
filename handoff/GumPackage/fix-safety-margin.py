#!/usr/bin/env python3
"""法定表示帯を印刷保証線（仕上がりから 3mm）の内側に入れ直す。

端に接している文字は拡大縮小では動かないので、帯そのものを縮小して余白を作る。
帯の上にある問い合わせテキスト・QR パネルには絶対に触れない（それらと帯の間の
空白行を境界として検出し、縮小後の帯がその空白より上に出ないよう倍率を決める）。
帯の周囲は帯の地の色で埋める。写真部分は全面塗り足しのまま。
"""
import os
import numpy as np
from PIL import Image

TW, TH = 69.0, 52.0
SAFE = 3.5
AR = TW / TH

def trim(path):
    im = Image.open(path).convert('RGB'); w, h = im.size
    if w/h > AR: nw = int(round(h*AR)); nh = h; x0 = (w-nw)//2; y0 = 0
    else:        nw = w; nh = int(round(w/AR)); x0 = 0; y0 = (h-nh)//2
    return im.crop((x0, y0, x0+nw, y0+nh))

def band_top(ink, nw, nh, px):
    """帯の直上にある空白帯（1.5mm 以上）の下端を帯の上端とする。
    帯の行間にも 1mm 弱の空白があるので、それより長い空白だけを境界とみなす。"""
    prof = ink.sum(axis=1)
    empty = prof < nw*0.002
    lo, hi = int(20*px), int(nh - 4*px)
    runs, s = [], None
    for y in range(lo, hi):
        if empty[y] and s is None: s = y
        elif not empty[y] and s is not None:
            if y - s >= 1.5*px: runs.append((s, y))
            s = None
    if s is not None and hi - s >= 1.5*px: runs.append((s, hi))
    if not runs: raise SystemExit('band gap not found')
    return runs[-1]                                   # (空白の上端, 空白の下端=帯の上端)

def fix(path, out):
    t = trim(path); nw, nh = t.size; px = nw/TW
    a = np.asarray(t).astype(int); ink = (a.min(axis=2) >= 200)
    gap0, top = band_top(ink, nw, nh, px)
    bh = nh - top
    sh_max = (nh - SAFE*px) - gap0                    # 縮小帯が空白より上に出ない上限
    s = min((TW - 2*SAFE)/TW, sh_max/bh)
    sw, sh = int(round(nw*s)), int(round(bh*s))
    ytop = nh - int(round(SAFE*px)) - sh
    # 地の色: 帯の各列の非文字画素の中央値を横方向にならす（1 行を伸ばすと縦縞になる）
    reg = a[top:nh]; msk = ~ink[top:nh]
    prof = np.zeros((1, nw, 3), dtype=np.uint8)
    for x in range(nw):
        col = reg[msk[:, x], x, :]
        prof[0, x] = np.median(col, axis=0) if len(col) else np.median(reg[:, x, :], axis=0)
    bar = Image.fromarray(prof).resize((24, 1), Image.LANCZOS).resize((nw, 1), Image.BICUBIC)
    o = t.copy()
    o.paste(bar.resize((nw, nh-ytop), Image.NEAREST), (0, ytop))       # 帯の下地
    o.paste(t.crop((0, top, nw, nh)).resize((sw, sh), Image.LANCZOS), ((nw-sw)//2, ytop))
    o.save(out, 'JPEG', quality=96, subsampling=0)
    # 検証
    b = np.asarray(o).astype(int); k = (b.min(axis=2) >= 200)
    ys, xs = np.nonzero(k[ytop:, :])
    lost = (ink & ~k)[:ytop, :].sum()
    return dict(gap=(gap0/px, top/px), s=s, ytop=ytop/px,
                l=xs.min()/px, r=(nw-1-xs.max())/px, b=(nh-1-(ytop+ys.max()))/px, lost=int(lost))

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.build', 'v6-src')
for lang in ('ja', 'en'):
    r = fix(os.path.join(SRC, '%s-front.jpg' % lang), os.path.join(SRC, '%s-front-A.jpg' % lang))
    print('%s  空白 %.1f-%.1fmm / 帯を %.1f%% に縮小 / 上端 %.2fmm' % (lang.upper(), r['gap'][0], r['gap'][1], r['s']*100, r['ytop']))
    print('    法定表示 左 %.2f / 右 %.2f / 下 %.2f mm    帯より上で失われた画素: %d' % (r['l'], r['r'], r['b'], r['lost']))
