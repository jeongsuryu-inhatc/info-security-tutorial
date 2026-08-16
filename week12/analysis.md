# week12 — 피싱 메일 3건 분석표

> 대상: `starter/phishing/sample{1,2,3}.eml` (교육용·익명화)
> 근거: `analyze-eml.sh` 자동 추출 결과 + 헤더 수동 판독

## 1. 종합 비교표

| 항목 | sample1 (택배) | sample2 (IT관리자) | sample3 (장학금) |
|---|---|---|---|
| From(표시) | `우체국 택배 <notice@korea-post.co.kr>` | `IT 보안팀 관리자 <admin@univ-mail.ac.kr>` | `국가장학재단 <support@univ-scholarship.or.kr>` |
| Return-Path | `bounce@mail-delivery-notice.top` | `it-support@secure-webmail-reset.com` | `no-reply@scholar-fund-2026.info` |
| Reply-To | `claim@mail-delivery-notice.top` | (없음) | `apply@scholar-fund-2026.info` |
| SPF | **fail** | softfail | **pass** |
| DKIM | none | **fail** | **pass** |
| DMARC | **fail** (p=none) | **fail** (p=quarantine) | **fail** (p=none) |
| 발신 서버(Received) | `185.220.101.4` (HELO mail-delivery-notice.top) | `vps-4471.hosting-cheap.net (203.0.113.201)` | `bulk12.mailsender-pro.info (45.133.1.88)` |
| From↔Return-Path 정렬 | 불일치 | 불일치 | 불일치 |
| 링크(표시) | `korea-post.co.kr` | `https://portal.univ-mail.ac.kr` | `여기를 클릭` |
| 링크(실제 URL) | `http://korea-post.co.kr.delivery-check.top/track` | `https://univ--mail.ac.kr-reset.com/login` | `http://scholar-fund-2026.info/apply` |
| 위장 기법 | 하위도메인 트릭(`...delivery-check.top`) | 하이픈 위장(`univ--mail...-reset.com`) | 무관 도메인 + 정렬 실패 |
| 심리 기법 | 긴급성(24시간 반송) | 권위(IT 보안팀)+긴급성(자정 정지) | 희소성(선착순 300명)+이득 |
| 위험 요구 | 링크 클릭 | 자격증명 입력 | 학번·계좌·신분증 |

## 2. 샘플별 핵심 판정

### sample1 — 택배 배송 실패
- **SPF=fail** + From(`korea-post.co.kr`)과 Return-Path(`mail-delivery-notice.top`) **도메인 불일치** → 명백한 사칭.
- 링크가 `korea-post.co.kr.delivery-check.top` — 진짜 도메인을 **하위도메인처럼** 앞에 붙인 트릭. 실제 호스트는 `delivery-check.top`.
- 심리: "24시간 내 미확인 시 반송"(긴급성).

### sample2 — 학교 IT 보안팀
- **DKIM=fail, DMARC=fail(p=quarantine)** → 서명 검증 실패 + 정렬 실패.
- 링크 표시는 `portal.univ-mail.ac.kr` 이지만 실제는 `univ--mail.ac.kr-reset.com`(하이픈 이중·`-reset.com` 접미) — 육안 혼동 노림.
- 심리: 권위("IT 보안팀 관리자") + 긴급성("자정까지 미인증 시 정지").

### sample3 — 국가장학재단 (가장 교묘)
- **SPF=pass, DKIM=pass 이지만 DMARC=fail** → 발신 도메인(`scholar-fund-2026.info`) 자체로는 인증을
  통과하지만, **표시(From) 도메인(`univ-scholarship.or.kr`)과 정렬(alignment)이 맞지 않아** 사칭으로 판정.
- **교훈**: "SPF/DKIM pass = 안전"이 아니다. **DMARC 정렬**이 핵심.
- 심리: 희소성("선착순 300명") + 금전 이득, Reply-To 가 본문 도메인과 상이.

## 3. 결론

세 건 모두 **DMARC=fail(정렬 불일치)** 과 **링크 표시/실제 URL 불일치**라는 공통 단서를 가진다.
인증 결과 일부(SPF/DKIM) 통과에 현혹되지 말고, **From 도메인 정렬**과 **실제 링크 호스트**를 확인하는 것이 판별의 핵심이다.
