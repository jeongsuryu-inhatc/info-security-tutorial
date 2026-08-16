#!/usr/bin/env bash
# starter/suricata/make-attack-pcap.sh
# ---------------------------------------------------------------------------
# 9주차 커스텀 룰 검증용 '공격 트래픽 pcap' 생성기.
#
# 커스텀 룰(SQLi/포트스캔/브루트포스)을 검증하려면 그런 공격이 담긴 pcap이
# 필요하다. 이 스크립트는 sudo 없이 Docker 컨테이너 안에서
#   - 임시 HTTP 서버(python) 기동
#   - 루프백(lo) 캡처(tcpdump)
#   - SQLi(GET URI) + 로그인 브루트포스(POST 반복) + 포트스캔(SYN 다수) 발생
# 을 수행해 ./pcaps/attack.pcap 을 만든다. (컨테이너 netns 안 loopback만
# 캡처하므로 호스트 트래픽과 무관하고 안전하다.)
#
# 실행: bash starter/suricata/make-attack-pcap.sh
# 산출: starter/suricata/pcaps/attack.pcap
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"   # starter/suricata/
mkdir -p pcaps

docker run --rm \
  --cap-add=NET_RAW --cap-add=NET_ADMIN \
  -v "$PWD/pcaps:/out" \
  nicolaka/netshoot:latest sh -c '
    set -e
    # 1) 표적 HTTP 서버(응답만 담당, 실제 취약 앱 아님)
    python3 -m http.server 8080 >/dev/null 2>&1 &
    sleep 1
    # 2) 루프백 캡처 시작
    tcpdump -i lo -w /out/attack.pcap >/dev/null 2>&1 &
    TP=$!
    sleep 1

    # 3-a) SQLi 시도 — URI에 인코딩해 전송(Suricata http.uri가 디코드해 매칭)
    curl -s "http://127.0.0.1:8080/login?email=%27%20OR%201=1--" >/dev/null
    curl -s "http://127.0.0.1:8080/search?q=%27%20UNION%20SELECT%20password%20FROM%20users--" >/dev/null

    # 3-b) 로그인 브루트포스 — /login POST 15회 연속
    for i in $(seq 1 15); do
      curl -s -X POST "http://127.0.0.1:8080/login" --data "email=a@b.com&password=w$i" >/dev/null
    done

    # 3-c) 포트 스캔 — 41개 포트로 SYN(연결 시도)
    for p in $(seq 9000 9040); do nc -z -w1 127.0.0.1 "$p" >/dev/null 2>&1 || true; done

    sleep 1
    kill "$TP" 2>/dev/null || true
    sleep 1
    echo "생성 완료: pcaps/attack.pcap ($(wc -c < /out/attack.pcap) bytes)"
  '
