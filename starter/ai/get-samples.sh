#!/usr/bin/env bash
# starter/ai/get-samples.sh
# ---------------------------------------------------------------------------
# 10주차 AI보안 실습용 샘플 이미지 3장을 내려받는다.
# ImageNet 클래스로 분류 가능한 공개 이미지(위키미디어 공용)를 samples/ 에 저장.
#
# 실행: bash starter/ai/get-samples.sh
# (네트워크 필요. 오프라인이면 직접 samples/ 에 jpg 를 넣어도 된다.)
# ---------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"          # starter/ai/
mkdir -p samples

# (라벨 → URL). ImageNet 에 대응 클래스가 있는 사진들.
fetch() {  # $1=파일명  $2=URL
  if [ -f "samples/$1" ]; then echo "  이미 있음: $1"; return; fi
  echo "  받는 중: $1"
  curl -fsSL --max-time 30 -o "samples/$1" "$2"
}

fetch panda.jpg  "https://upload.wikimedia.org/wikipedia/commons/0/0f/Grosser_Panda.JPG"
fetch cat.jpg    "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg"
fetch coffee.jpg "https://upload.wikimedia.org/wikipedia/commons/4/45/A_small_cup_of_coffee.JPG"

echo "완료. samples/ 내용:"
ls -la samples/*.jpg 2>/dev/null || true
