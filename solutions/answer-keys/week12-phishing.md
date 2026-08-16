# 12주차 정답지 — 피싱 샘플 해부 (조교용)

제공 샘플(`starter/phishing/`)의 핵심 단서.

## sample1-delivery.eml (택배 사칭)
- **인증**: `spf=fail`, `dkim=none`, `dmarc=fail (p=none)`
- **From/Return-Path 불일치**: From `notice@korea-post.co.kr` vs Return-Path `bounce@mail-delivery-notice.top`, Reply-To 도 외부
- **발신 서버**: `185.220.101.4` (택배사와 무관)
- **위장 링크**: 표시 `korea-post.co.kr` ↔ 실제 `korea-post.co.kr.delivery-check.top`(서브도메인 위장)
- **심리 기법**: 긴급성("24시간 내"), 손실 회피("자동 반송")

## sample2-itadmin.eml (학교 IT 사칭)
- **인증**: `spf=softfail`, `dkim=fail(서명 검증 실패)`, `dmarc=fail (p=quarantine)`
- **From**: `admin@univ-mail.ac.kr`(자기 도메인 사칭) vs 발신 서버 `vps-4471.hosting-cheap.net (203.0.113.201)`
- **위장 링크**: 표시 `portal.univ-mail.ac.kr` ↔ 실제 `univ--mail.ac.kr-reset.com`(하이픈/서브도메인 트릭)
- **심리 기법**: 권위("IT 보안팀 관리자"), 긴급성("자정까지 정지")

## sample3-scholarship.eml (장학재단 사칭) — 함정 문제
- **인증**: `spf=pass`, `dkim=pass` **이지만** `dmarc=fail` — **정렬(alignment) 불일치**가 핵심
  (SPF/DKIM은 발신 도메인 `scholar-fund-2026.info` 기준 pass이나, 표시 From `univ-scholarship.or.kr` 와 정렬 안 됨)
- **Reply-To 상이**: `apply@scholar-fund-2026.info`
- **심리 기법**: 희소성("선착순 300명"), 이득("200만원 환급"), 개인정보 요구(학번·계좌·신분증)

## 채점 포인트
- 3건의 SPF/DKIM/DMARC 값 **정확 판독**(35)
- **sample3의 "pass인데 위험"**(DMARC 정렬 실패)을 잡아내면 우수. "spf=pass라 안전"이라 쓰면 감점
- From vs Return-Path/Reply-To 불일치, 유사도메인 지목
- 심리 기법 분류(긴급성/권위/희소성/이득)
- 교육용 피싱 제작물은 **발송/공유 흔적 없어야 함**(있으면 징계). 태깅 주석 포함 여부 확인
