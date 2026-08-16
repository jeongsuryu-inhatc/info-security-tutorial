#!/usr/bin/env bash
# starter/incident/analyze.sh
# ---------------------------------------------------------------------------
# 11주차 침해대응 실습 — 로그 3종에서 침해 흔적을 자동 추출하고
# 시각순 타임라인 CSV를 만든다. (grep + perl 만 사용, 추가 설치 불필요)
#
# 실행: bash starter/incident/analyze.sh
# 산출:
#   - 화면: 공격자 IP / IoC / 단계별 흔적
#   - week11/timeline.csv : 정규화(ISO8601)된 시각순 타임라인
# ---------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"          # starter/incident/

WEB=web-access.log
AUTH=auth.log
DB=db-query.log
OUT_DIR=../../week11
OUT=$OUT_DIR/timeline.csv
mkdir -p "$OUT_DIR"

echo "== [1] 웹 로그: 공격 도구/SQLi 흔적 =="
grep -Ei "sqlmap|union select|or 1=1|sleep\(|'--" "$WEB" || true

echo
echo "== [2] 실패 응답(401/500) =="
grep -E '" (401|500) ' "$WEB" || true

echo
echo "== [3] 인증 로그: 우회 로그인/관리자 행위 =="
grep -Ei "LOGIN SUCCESS|bypass|ADMIN ACTION|SESSION" "$AUTH" || true

echo
echo "== [4] DB 로그: 권한 밖 쿼리(WHERE 없는 UPDATE, 자격증명 SELECT) =="
grep -Ei "UPDATE|DELETE|SELECT email,password|SELECT \*" "$DB" || true

# 공격자 IP 후보: sqlmap UA 를 가진 소스 IP (가장 많이 등장)
ATTACKER=$(grep -i sqlmap "$WEB" | awk '{print $1}' | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')
echo
echo "== [5] 공격자 IP 추정: ${ATTACKER:-(미검출)} — 전 로그 교차 검색 =="
if [ -n "${ATTACKER:-}" ]; then
  grep -rn "$ATTACKER" . || true
fi

# --- 타임라인 CSV 생성 (3개 로그의 시각을 ISO8601 로 정규화해 병합·정렬) ---
echo
echo "== [6] 타임라인 CSV 생성 -> $OUT =="
{
  # 웹 로그: 198.51.100.14 ... [14/Aug/2026:02:55:20 +0900] "POST /login HTTP/1.1" 401 ...
  # 주의: 캡처($1..)는 s/// 치환이 성공하면 초기화되므로, 먼저 변수에 담은 뒤 치환한다.
  perl -ne '
    my %m=(Jan,"01",Feb,"02",Mar,"03",Apr,"04",May,"05",Jun,"06",
           Jul,"07",Aug,"08",Sep,"09",Oct,"10",Nov,"11",Dec,"12");
    if (/^(\S+).*\[(\d+)\/(\w+)\/(\d+):([\d:]+) .*?"([A-Z]+ [^"]*)" (\d{3})/) {
      my ($ip,$day,$mon,$yr,$hms,$req,$status)=($1,$2,$3,$4,$5,$6,$7);
      $req =~ s/,/ /g;
      print "$yr-$m{$mon}-${day}T$hms+09:00,web,$ip $req [$status]\n";
    }' "$WEB"

  # auth 로그: Aug 14 03:13:44 shopguard <proc>: <msg>
  perl -ne '
    my %m=(Jan,"01",Feb,"02",Mar,"03",Apr,"04",May,"05",Jun,"06",
           Jul,"07",Aug,"08",Sep,"09",Oct,"10",Nov,"11",Dec,"12");
    if (/^(\w+)\s+(\d+)\s+([\d:]+)\s+\S+\s+(.*)$/) {
      my ($mon,$day,$hms,$msg)=($1,$2,$3,$4);
      $day=sprintf("%02d",$day); $msg =~ s/,/ /g;
      print "2026-$m{$mon}-${day}T$hms+09:00,auth,$msg\n";
    }' "$AUTH"

  # DB 로그: 2026-08-14T03:15:31+09:00 app <query>  (이미 ISO)
  perl -ne '
    if (/^(\d{4}-\d{2}-\d{2}T[\d:]+\+\d{2}:\d{2})\s+(.*)$/) {
      my ($ts,$msg)=($1,$2);
      $msg =~ s/,/ /g;
      print "$ts,db,$msg\n";
    }' "$DB"
} | sort | { echo "timestamp,source,event"; cat; } > "$OUT"

echo "생성 완료: $OUT ($(($(wc -l < "$OUT")-1)) 이벤트)"
