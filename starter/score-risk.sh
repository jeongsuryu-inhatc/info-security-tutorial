#!/usr/bin/env bash
# starter/score-risk.sh
# ---------------------------------------------------------------------------
# 13주차 보안관리 실습 — 위험평가 매트릭스의 risk_score 를 자동 계산하고
# 위험도 높은 순으로 정렬한다. (awk 만 사용)
#
# 입력 CSV 컬럼:
#   asset_id,asset_name,threat,vulnerability,source_week,
#   likelihood_1to5,impact_1to5,risk_score,treatment,control
#   → likelihood 와 impact 를 채우면 risk_score = likelihood × impact 로 계산.
#
# 실행: bash starter/score-risk.sh week13/risk-matrix.csv
#   - risk_score 컬럼을 채운 결과를 표준출력으로(원본은 보존)
#   - 위험도 상위 항목을 요약 출력
# ---------------------------------------------------------------------------
set -uo pipefail

CSV="${1:-week13/risk-matrix.csv}"
if [ ! -f "$CSV" ]; then
  echo "사용법: bash starter/score-risk.sh <risk-matrix.csv>" >&2
  exit 1
fi

# risk_score = likelihood(6번째) × impact(7번째). 헤더/주석/빈 줄은 그대로 통과.
scored=$(awk -F, 'BEGIN{OFS=","}
  NR==1 || $0 ~ /^#/ || NF<7 { print; next }         # 헤더/주석/불완전 행은 원본 유지
  {
    l=$6+0; i=$7+0;
    if (l>0 && i>0) $8=l*i;                            # 점수 계산
    print;
  }' "$CSV")

echo "$scored"

echo "" >&2
echo "== 위험도 상위(내림차순) ==" >&2
echo "$scored" | awk -F, 'NR>1 && $8+0>0 {printf "  %2d  %-16s %-14s (가능성 %s × 영향 %s)\n", $8, $2, $3, $6, $7}' \
  | sort -rn >&2
