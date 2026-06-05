#!/usr/bin/env bash
# booted シミュレータの現在画面を Flutter スクショとして保存する。
#   使い方: 対象を sim に表示した状態で  ./capture.sh   (name はフォルダ名から自動)
# 表示方法: flutter run -t lib-design/handoff/{Name}/main_preview.dart -d <booted-sim>
set -euo pipefail
cd "$(dirname "$0")"
name="${1:-$(basename "$PWD")}"
mkdir -p shots
xcrun simctl io booted screenshot "shots/${name}_flutter.png"
echo "saved shots/${name}_flutter.png — now: ./build.sh"
