#!/usr/bin/env python3
"""版面を印刷保証線の内側に入れる。

ラクスルの確認用 PDF から実測した保証線は仕上がり 69x52mm から 2.0mm 内側（65x48mm）。
元絵は文字が仕上がり線に接しているため（EN 問い合わせ文 0.15mm / JA 0.41mm など）、
版面全体を SCALE 倍に縮めて仕上がりの中央に置き、周囲は同じ絵を塗り足しいっぱいに
拡大してぼかしたものを敷く。ぼかすのは端伸ばしの縞や鏡像の逆さ文字を出さないため。

出力は 75x58mm（塗り足し込み）。PDF 側は塗り足しリングを追加しない。
"""
import os
from PIL import Image, ImageFilter, ImageEnhance

TW, TH, BL = 69.0, 52.0, 3.0
MW, MH = TW+2*BL, TH+2*BL
SCALE  = 0.905          # 全要素が保証線から 2.5mm 以上内側に入る最大に近い倍率
BLUR   = 2.5            # mm
DIM    = 0.60
AR = TW/TH

def cover(im, ar):
    w, h = im.size
    if w/h > ar: nw = int(round(h*ar)); nh = h; x0 = (w-nw)//2; y0 = 0
    else:        nw = w; nh = int(round(w/ar)); x0 = 0; y0 = (h-nh)//2
    return im.crop((x0, y0, x0+nw, y0+nh))

def inset(path, out):
    src = cover(Image.open(path).convert('RGB'), AR)
    nw, nh = src.size; px = nw/TW
    bw, bh = int(round(MW*px)), int(round(MH*px))
    bg = src.resize((bw, bh), Image.LANCZOS).filter(ImageFilter.GaussianBlur(radius=BLUR*px))
    bg = ImageEnhance.Brightness(bg).enhance(DIM)
    iw, ih = int(round(nw*SCALE)), int(round(nh*SCALE))
    bg.paste(src.resize((iw, ih), Image.LANCZOS), ((bw-iw)//2, (bh-ih)//2))
    bg.save(out, 'JPEG', quality=96, subsampling=0)
    return (TW-TW*SCALE)/2, (TH-TH*SCALE)/2

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.build', 'v6-src')
for lang in ('ja', 'en'):
    for face, ext in (('front', '.jpg'), ('back', '.png')):
        mx, my = inset(os.path.join(SRC, '%s-%s%s' % (lang, face, ext)),
                       os.path.join(SRC, '%s-%s-S.jpg' % (lang, face)))
print('倍率 %.3f  仕上がり線からの余白 左右 %.2f / 上下 %.2f mm  (出力 75x58mm)' % (SCALE, mx, my))
