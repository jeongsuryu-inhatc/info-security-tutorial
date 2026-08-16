#!/usr/bin/env bash
# apply-solution.sh — 스타터 앱 복사 후 모범답안을 덮어써 '만점 제출물'을 만든다(하니스 자가점검용).
# 사용: grading/apply-solution.sh <대상디렉터리>
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:?사용법: apply-solution.sh <대상디렉터리>}"

rm -rf "$DEST"
cp -r "$HERE/starter/shopguard-app" "$DEST"

SOL="$HERE/solutions/shopguard-app-secure"
cp "$SOL/auth.js"            "$DEST/auth.js"          # 4주차(기본). 7주차 점검 시 auth-bcrypt 로 교체
cp "$SOL/utils.js"           "$DEST/utils.js"
cp "$SOL/utils.test.js"      "$DEST/utils.test.js"
cp "$SOL/routes/orders.js"   "$DEST/routes/orders.js"
cp "$SOL/aes.js"             "$DEST/aes.js"
cp "$SOL/migrate-bcrypt.js"  "$DEST/migrate-bcrypt.js"
cp "$SOL/scanner.js"         "$DEST/scanner.js"
cp "$SOL/rules.json"         "$DEST/rules.json"

echo "적용 완료 → $DEST"
echo "다음: cd $DEST && npm install && npm run seed"
echo "7주차 점검 시: cp $SOL/auth-bcrypt.js $DEST/auth.js"
