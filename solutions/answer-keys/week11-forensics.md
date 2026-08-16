# 11주차 정답지 — 침해 타임라인 · IoC (조교용)

제공 로그(`starter/incident/`) 기준 모범 재구성.

## 공격자 식별
- **공격자 IP**: `203.0.113.66` (User-Agent `sqlmap/1.7`)
- 무관/양성 트래픽: `198.51.100.14`(초반 실패 로그인), `198.51.100.22`/`manager@shop.com`(주간 정상 접속)

## 타임라인 (2026-08-14, KST)

| 시각 | 소스 | 이벤트 | 단계 |
|---|---|---|---|
| 03:10:55~03:11:01 | auth.log | 203.0.113.66 → admin 계정 SSH 무차별 대입 실패 | 정찰 |
| 03:11:02~03:11:12 | web-access | `/login` 에 sqlmap SQLi 시도 반복(401): `OR SLEEP(3)`, `UNION SELECT 1,2,3` | 취약점 탐색 |
| 03:13:44 | web + auth + db | `admin@shop.com'--` 로 **인증 우회 성공(200)**, LOGIN SUCCESS "bypass" | 침투 |
| 03:14:01 | web + db | `/admin/orders` 조회, `SELECT * FROM orders` | 권한 상승/열람 |
| 03:15:30 | web + db | `/admin/orders/cancel-all` → `UPDATE orders SET total=0`(WHERE 없음) | **목적 달성(대량 변조)** |
| 03:16:10 | web + db | `/admin/export?table=users` → `SELECT email,password,phone` | **데이터 유출** |

## 침해 지표(IoC)
- IP `203.0.113.66`, UA `sqlmap/1.7`
- 침해 계정: `admin@shop.com` (SQLi 인증 우회로 탈취)
- 페이로드: `admin@shop.com'--`, `' OR SLEEP(3)--`, `' UNION SELECT 1,2,3--`
- 악성 쿼리: `UPDATE orders SET total=0`(WHERE 절 없음), `SELECT email,password,phone FROM users`

## 근본 원인 (실습 연계)
1. 로그인 **SQL Injection** (4주차 미패치)
2. **평문 비밀번호** 저장 → 유출 시 즉시 악용 (7주차 연계)
3. `/admin/*` **접근 통제 부재** (8주차 IDOR와 동일 계열)

## 영향 범위
- 전체 주문 데이터 무결성 훼손(total=0, product 변조)
- 회원 이메일·비밀번호·전화번호 유출(기밀성)

## 채점 포인트
- 타임라인에 **최소 5개 이벤트** + 각 이벤트 **로그 라인 인용**(40)
- 공격자 IP·페이로드·악성쿼리 IoC 정확 식별(포함되어야 함)
- 추정과 사실 구분(사실엔 근거 로그), 타임존 명시
- **감점**: 203.0.113.66 대신 198.51.100.x 를 공격자로 지목 / cancel-all 의 WHERE 부재(대량 변조) 누락
