#!/usr/bin/env bash
# run-all.sh — 코드 주차(4·5·6·7·8) 자동채점 일괄 실행
# 사용: grading/run-all.sh <제출_shopguard-app_경로> [scanner.js_경로]
#   미지정 시 starter/shopguard-app 대상(모범답안 적용 후 자가점검용).
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
APP="${1:-$HERE/../starter/shopguard-app}"
SCANNER="${2:-$APP/scanner.js}"

echo "########## ShopGuard 자동채점 ##########"
echo "대상 앱: $APP"

node "$HERE/grade-week04.cjs" "$APP" || true
node "$HERE/grade-week05.cjs" "$APP" || true
node "$HERE/grade-week06.cjs" "$SCANNER" || true
node "$HERE/grade-week07.cjs" "$APP" || true
node "$HERE/grade-week08.cjs" "$APP" || true

echo ""
echo "※ 자동채점은 '기능/보안 정확성' 부분점수다. 보고서·분석은 rubric.md 로 수동 채점하라."
