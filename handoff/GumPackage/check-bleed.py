#!/usr/bin/env python3
"""全面ビジュアル面の断裁シミュレーション。

artboard 75×58mm（trim 69×52 ＋ 塗り足し 3mm）に cover で敷いたときに、
元画像のどこが断裁で落ちるか・文字が安全域 3mm を割らないかを目で確かめる。
HTML にテキストが無い面（EN 裏）はこれでしか検証できない。

usage: python3 check-bleed.py <画像> <出力png>
"""
import sys
from PIL import Image, ImageDraw

TW, TH, BL = 69.0, 52.0, 3.0          # trim / 塗り足し
MW, MH = TW + 2*BL, TH + 2*BL          # 75 x 58
SAFE = 3.0
PX = 24                                # 描画倍率 (px/mm)

def cover(im, w_mm, h_mm):
    ar = w_mm / h_mm
    w, h = im.size
    if w / h > ar:                     # 画像が横長 -> 左右を削る
        nw, nh = int(round(h * ar)), h
        x0, y0 = (w - nw) // 2, 0
    else:                              # 画像が縦長 -> 上下を削る
        nw, nh = w, int(round(w / ar))
        x0, y0 = 0, (h - nh) // 2
    return im.crop((x0, y0, x0 + nw, y0 + nh)), (w - nw) / 2 / (w / w_mm if w > nw else 1), (h - nh) / 2

src = Image.open(sys.argv[1]).convert('RGB')
W, H = int(MW * PX), int(MH * PX)
face, _, _ = cover(src, MW, MH)
cv = face.resize((W, H), Image.LANCZOS)

d = ImageDraw.Draw(cv, 'RGBA')
# 塗り足しに落ちる領域を赤で覆う
for box in [(0, 0, W, BL*PX), (0, (BL+TH)*PX, W, H), (0, 0, BL*PX, H), ((BL+TW)*PX, 0, W, H)]:
    d.rectangle(box, fill=(255, 40, 90, 70))
d.rectangle([BL*PX, BL*PX, (BL+TW)*PX, (BL+TH)*PX], outline=(255, 45, 120, 255), width=3)          # 仕上がり
d.rectangle([(BL+SAFE)*PX, (BL+SAFE)*PX, (BL+TW-SAFE)*PX, (BL+TH-SAFE)*PX],
            outline=(0, 255, 157, 255), width=2)                                                    # 安全域
cv.save(sys.argv[2])

ar = src.width / src.height
print(f'元画像 {src.width}×{src.height}px  アスペクト {ar:.3f}')
print(f'artboard 75×58 = {MW/MH:.3f} / trim 69×52 = {TW/TH:.3f}')
if abs(ar - MW/MH) < 0.008:
    print('=> 塗り足し込みのアスペクト。cover でほぼ無損失')
else:
    sc = max(MW / src.width, MH / src.height) if False else None
    if ar > MW/MH:
        lost = (src.width - src.height * MW/MH) / 2 / src.width * 100
        print(f'=> 横に長い。左右それぞれ元画像の {lost:.1f}% が cover で切られる')
    else:
        lost = (src.height - src.width / (MW/MH)) / 2 / src.height * 100
        print(f'=> 縦に長い。上下それぞれ元画像の {lost:.1f}% が cover で切られる')
    print(f'   さらに塗り足し 3mm ぶん（赤い帯）が断裁で落ちる')
print(f'赤い帯＝断裁で落ちる / ピンク枠＝仕上がり 69×52 / 緑枠＝安全域 63×46。緑の内側に文字があること')
print(f'-> {sys.argv[2]}')
