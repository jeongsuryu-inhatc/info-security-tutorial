#!/usr/bin/env bash
# check-files.sh — 제출물 필수 파일 존재 여부 점검 (전 주차)
# 사용: grading/check-files.sh <제출루트>   (weekNN/ 하위 구조 가정)
set -uo pipefail
ROOT="${1:?사용법: check-files.sh <제출루트>}"

declare -A REQUIRED=(
  [week01]="report.md shopguard-cia.csv"
  [week02]="hardening-checklist.md lynis-before.txt lynis-after.txt report.md"
  [week03]="login-plaintext.pcapng firewall-rules.sh report.md"
  [week04]="exploits.md auth.js report.md"
  [week05]="utils-safe.js utils.test.js report.md"
  [week06]="scanner.js rules.json report.md"
  [week07]="classic.js migrate-bcrypt.js aes.js report.md"
  [week08]="server-secure.js access.log report.md"
  [week09]="local.rules eve-excerpt.json report.md"
  [week10]="iot-report.md adversarial.py report.md"
  [week11]="timeline.csv ir-report.md playbook.md"
  [week12]="analysis.md edu-phish.html checklist.md"
  [week13]="risk-matrix.csv security-policy.md audit-checklist.md"
)

total=0; missing=0
for wk in $(echo "${!REQUIRED[@]}" | tr ' ' '\n' | sort); do
  for f in ${REQUIRED[$wk]}; do
    total=$((total+1))
    if [ -f "$ROOT/$wk/$f" ]; then
      echo "  [OK]   $wk/$f"
    else
      echo "  [MISS] $wk/$f"
      missing=$((missing+1))
    fi
  done
done
echo "── 파일 점검: $((total-missing))/$total 존재, 누락 $missing"
exit $([ "$missing" -eq 0 ] && echo 0 || echo 1)
