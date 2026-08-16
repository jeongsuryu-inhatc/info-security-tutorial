#!/usr/bin/env bash
# starter/phishing/analyze-eml.sh
# ---------------------------------------------------------------------------
# 12주차 사회공학 실습 — 피싱 .eml 3건의 기술적 단서를 자동 추출한다.
# (grep/sed/perl 만 사용, 추가 설치 불필요)
#
# 각 메일에서:
#   - 인증 결과(SPF/DKIM/DMARC)
#   - From / Return-Path / Reply-To 와 도메인 불일치
#   - 실제 발신 서버(Received)
#   - 본문 링크: 표시 텍스트 vs 실제 URL(유사도메인 위장)
#
# 실행: bash starter/phishing/analyze-eml.sh
# ---------------------------------------------------------------------------
# 헤더가 없을 때 grep 이 1을 반환하므로 -e 는 쓰지 않는다(부재는 정상 케이스).
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"          # starter/phishing/

# 헤더 한 줄 값 추출(대소문자 무시, 첫 매치). 없으면 빈 문자열.
hdr() { grep -im1 "^$1:" "$2" 2>/dev/null | sed -E "s/^[^:]+:[[:space:]]*//; s/[[:space:]]+$//" || true; }
# 이메일 주소에서 도메인만
dom() { printf '%s' "$1" | perl -ne 'print "$1\n" if /@([A-Za-z0-9.-]+)/'; }

for eml in sample*.eml; do
  echo "══════════════════════════════════════════════════════"
  echo "■ $eml"
  echo "──────────────────────────────────────────────────────"

  from=$(hdr From "$eml"); rpath=$(hdr Return-Path "$eml"); reply=$(hdr Reply-To "$eml")
  subj=$(hdr Subject "$eml")

  echo "  Subject     : $subj"
  echo "  From        : $from"
  echo "  Return-Path : $rpath"
  echo "  Reply-To    : ${reply:-(없음)}"

  echo "  -- 인증 결과 --"
  grep -Eio "spf=[a-z]+|dkim=[a-z]+|dmarc=[a-z]+( \(p=[a-z]+\))?" "$eml" | sed 's/^/    /' | sort -u

  # From 도메인 vs Return-Path 도메인 정렬(alignment) 확인
  fdom=$(dom "$from"); rdom=$(dom "$rpath")
  echo "  -- 도메인 정렬(alignment) --"
  echo "    From 도메인        : ${fdom:-?}"
  echo "    Return-Path 도메인 : ${rdom:-?}"
  if [ -n "$fdom" ] && [ "$fdom" != "$rdom" ]; then
    echo "    ⚠️ 불일치 → 표시명(From)과 실제 발신 도메인이 다르다(사칭 의심)"
  fi

  echo "  -- 실제 발신 서버(Received) --"
  grep -Ei "^Received:" "$eml" | sed -E 's/^Received:[[:space:]]*/    /' | head -2

  echo "  -- 본문 링크(표시 vs 실제) --"
  # href="URL"와 그 뒤 표시 텍스트를 함께 보여준다
  perl -0777 -ne '
    while (/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/sg) {
      my ($url,$txt)=($1,$2); $txt =~ s/\s+/ /g; $txt =~ s/^\s+|\s+$//g;
      print "    실제 URL : $url\n    표시     : $txt\n";
    }' "$eml"
  echo
done

echo "해석 힌트: spf/dkim=pass 라도 dmarc=fail(정렬 불일치)이면 사칭이다."
echo "          링크의 '표시 도메인'이 실제 URL 호스트와 다르면 위장이다(유사·하이픈 도메인)."
