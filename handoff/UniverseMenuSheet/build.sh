#!/usr/bin/env bash
# design vs flutter の左右比較画像を生成する（このフォルダ = 1コンポーネント自己完結）。
#   clean.html               → デザイン描画 (Chrome)
#   shots/{Name}_flutter.png → Flutter スクショ (capture.sh で撮る)
#   出力: ../../preview/{Name}.png → 左右ならべの合成画像 (preview にはこれだけ残す)
# 依存: Google Chrome のみ (ImageMagick 不要 / 合成も Chrome で行う)
set -euo pipefail
cd "$(dirname "$0")"
name="$(basename "$PWD")"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SCALE=2
DW=390; DH=780                       # design pane 論理サイズ (clean.html と一致)
mkdir -p shots ../../preview

shot() { # html out w h
  case "$1" in /*) url="file://$1" ;; *) url="file://$PWD/$1" ;; esac
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 \
    --force-device-scale-factor="$SCALE" --window-size="$3,$4" \
    --screenshot="$2" "$url" >/dev/null 2>&1
}

# 1) design → png
shot "clean.html" "shots/${name}_design.png" "$DW" "$DH"

# 2) flutter スクショ (無ければ撮影待ちプレースホルダ)
if [ -f "shots/${name}_flutter.png" ]; then
  fsrc="shots/${name}_flutter.png"; fnote=""
else
  fsrc=""; fnote="撮影待ち — ./capture.sh"
fi

# 3) 左右合成用 html を生成して撮る
cat > "/tmp/_cmp_${name}.html" <<HTML
<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="$PWD/../../DesignSystem/colors_and_type.css">
<style>
  html,body{margin:0;background:#0d0d0f;font-family:var(--font-jp);}
  .wrap{display:flex;gap:20px;padding:22px;align-items:flex-start;}
  .col{display:flex;flex-direction:column;gap:8px;}
  .cap{font:700 12px var(--font-latin);letter-spacing:.12em;text-transform:uppercase;}
  .cap.d{color:#7ee0a0;} .cap.f{color:#7aa7ff;}
  .box{width:${DW}px;height:${DH}px;border-radius:14px;border:1px solid rgba(255,255,255,.10);
    background:#000 center/contain no-repeat;}
  .ph{display:flex;align-items:center;justify-content:center;color:var(--text-2);
    font:600 13px var(--font-jp);text-align:center;padding:0 24px;}
  .ttl{color:#fff;font:700 16px var(--font-jp);padding:22px 22px 0;}
</style></head><body>
  <div class="ttl">${name} — design vs flutter</div>
  <div class="wrap">
    <div class="col"><div class="cap d">Design (Claude Design)</div>
      <div class="box" style="background-image:url('$PWD/shots/${name}_design.png')"></div></div>
    <div class="col"><div class="cap f">Flutter</div>
      ${fsrc:+<div class="box" style="background-image:url('$PWD/$fsrc')"></div>}
      ${fnote:+<div class="box ph">$fnote</div>}</div>
  </div>
</body></html>
HTML
CW=$((DW*2+20+44)); CH=$((DH+70))
shot "/tmp/_cmp_${name}.html" "../../preview/${name}.png" "$CW" "$CH"
echo "built ../../preview/${name}.png  ${fnote:+($fnote)}"
