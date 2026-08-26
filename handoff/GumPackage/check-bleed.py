#!/usr/bin/env python3
"""入稿前の目視チェック。make-poster-pdf.py と同じ組み方で 1 面を再現し、
仕上がり線・安全域・塗り足しを重ねて出す。

赤い帯 = 断裁で落ちる塗り足し（端ピクセルの引き伸ばしなので絵は欠けない）
ピンク枠 = 仕上がり 69x52mm ／ 緑枠 = 安全域 63x46mm
文字・QR・ロゴが緑枠の内側に収まっていれば「文字が切れる」指摘は出ない。

usage: python3 check-bleed.py <画像> <出力png>
"""
import sys
from PIL import Image, ImageDraw

TW, TH, BL, SAFE = 69.0, 52.0, 3.0, 3.0
MW, MH = TW + 2*BL, TH + 2*BL
AR = TW / TH
PX = 26

src = Image.open(sys.argv[1]).convert('RGB')
w, h = src.size
if w / h > AR:
    nw, nh = int(round(h * AR)), h; x0, y0 = (w - nw) // 2, 0
    cut = (w - nw) / 2 / (w / TW)
else:
    nw, nh = w, int(round(w / AR)); x0, y0 = 0, (h - nh) // 2
    cut = (h - nh) / 2 / (h / TH)
trim = src.crop((x0, y0, x0 + nw, y0 + nh))

cv = Image.new('RGB', (int(MW*PX), int(MH*PX)))
cv.paste(trim.resize((int(TW*PX), int(TH*PX)), Image.LANCZOS), (int(BL*PX), int(BL*PX)))
# 塗り足しは端伸ばし（PDF と同じ作り方）
t = cv.crop((int(BL*PX), int(BL*PX), int((BL+TW)*PX), int((BL+TH)*PX)))
r, W2, H2 = int(BL*PX), int(TW*PX), int(TH*PX)
cv.paste(t.crop((0,0,1,H2)).resize((r,H2), Image.NEAREST), (0, r))
cv.paste(t.crop((W2-1,0,W2,H2)).resize((r,H2), Image.NEAREST), (r+W2, r))
cv.paste(t.crop((0,0,W2,1)).resize((W2,r), Image.NEAREST), (r, 0))
cv.paste(t.crop((0,H2-1,W2,H2)).resize((W2,r), Image.NEAREST), (r, r+H2))

d = ImageDraw.Draw(cv, 'RGBA')
for box in [(0,0,cv.width,BL*PX), (0,(BL+TH)*PX,cv.width,cv.height),
            (0,0,BL*PX,cv.height), ((BL+TW)*PX,0,cv.width,cv.height)]:
    d.rectangle(box, fill=(255, 40, 90, 60))
d.rectangle([BL*PX, BL*PX, (BL+TW)*PX, (BL+TH)*PX], outline=(255, 45, 120, 255), width=3)
d.rectangle([(BL+SAFE)*PX, (BL+SAFE)*PX, (BL+TW-SAFE)*PX, (BL+TH-SAFE)*PX],
            outline=(0, 255, 157, 255), width=2)
cv.save(sys.argv[2])

print('元画像 %dx%d px  アスペクト %.3f  (trim 69:52 = %.3f)' % (w, h, w/h, AR))
print('trim 実効 %.0f dpi%s' % (nw / TW * 25.4, '  !! 350dpi 未満' if nw/TW*25.4 < 350 else ''))
print('69:52 に合わせて片側 %.2fmm を crop（塗り足しは端伸ばしなので絵の欠けはこの crop 分だけ）' % cut)
print('緑枠の内側に文字・QR・ロゴが収まっているか目で確認 -> %s' % sys.argv[2])
