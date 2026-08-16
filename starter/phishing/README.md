# 12주차 피싱 샘플 (교육용·익명화)

세 건 모두 **학습 목적으로 제작된 가짜 메일**이다. 실제 조직·도메인과 무관하며,
발신 도메인은 실습용으로 지어낸 것이다. 절대 재발송·배포하지 않는다.

| 파일 | 사칭 대상 | 핵심 단서(학생이 찾아낼 것) |
|---|---|---|
| `sample1-delivery.eml` | 택배 배송 실패 | spf=fail, From vs Return-Path 불일치, 유사도메인(`...delivery-check.top`), 긴급성 |
| `sample2-itadmin.eml` | 학교 IT 보안팀 | dkim=fail, dmarc=fail, 권위 사칭, 하이픈 위장(`univ--mail.ac.kr-reset.com`) |
| `sample3-scholarship.eml` | 국가장학재단 | spf/dkim=pass지만 **dmarc=fail(정렬 불일치)**, Reply-To 상이, 희소성 |

`.eml` 은 텍스트 파일이다. 에디터로 헤더를 직접 보거나, 메일 클라이언트로 열어 분석한다.
