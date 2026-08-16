# week11 — 침해사고 보고서 (IR Report)

> 대상: ShopGuard · 분석 로그: `starter/incident/{web-access,auth,db-query}.log`
> 타임라인 근거: `week11/timeline.csv` (analyze.sh 생성)

## 1. 개요

- **무엇이**: SQL Injection 으로 로그인 인증을 우회해 **관리자(admin) 계정이 탈취**되었고,
  이를 통해 **전체 주문이 조작(취소)** 되고 **회원 자격증명·개인정보(PII)가 탈취**되었다.
- **언제**: 2026-08-14 03:10~03:16 (KST), 약 6분간.
- **어떻게**: 외부 IP `203.0.113.66` 이 `sqlmap/1.7` 로 `/login` 에 SQLi 를 반복 시도,
  `admin@shop.com'--` 페이로드로 비밀번호 검사를 우회(HTTP 200)한 뒤 관리자 기능을 실행.

## 2. 타임라인 (근거 로그 인용)

| 시각(KST) | 소스 | 이벤트(근거) | 해석 |
|---|---|---|---|
| 03:10:55 | auth | `Failed password for invalid user admin from 203.0.113.66` | SSH 무차별 대입(정찰) |
| 03:11:05 | web | `POST /login ... "email=admin@shop.com' AND 1=1--" "sqlmap/1.7"` (401) | SQLi 탐색 |
| 03:11:07 | web | `"email=admin@shop.com' OR SLEEP(3)--"` (401) | 시간기반 SQLi 시도 |
| 03:11:12 | web | `"email=admin@shop.com' UNION SELECT 1,2,3--"` (401) | UNION 기반 시도 |
| 03:13:44 | web/auth | `POST /login ... "admin@shop.com'--"` → **200** / `LOGIN SUCCESS ... note="password check bypassed"` | **인증 우회 성공(침투)** |
| 03:14:01 | db/web | `SELECT * FROM orders` / `GET /admin/orders` (200) | 권한 확보·정찰 |
| 03:15:31 | db/auth | `UPDATE orders SET total=0, product='CANCELLED'` (WHERE 없음) / `ADMIN ACTION cancel-all-orders` | **전체 주문 조작(목적 달성)** |
| 03:16:11 | db/auth | `SELECT email,password,phone FROM users` / `ADMIN ACTION export table=users` | **자격증명·PII 탈취** |

## 3. 침해 지표 (IoC)

| 유형 | 값 |
|---|---|
| 공격자 IP | `203.0.113.66` |
| 공격 도구(UA) | `sqlmap/1.7` |
| 우회 페이로드 | `admin@shop.com'--` (그 외 `' AND 1=1--`, `' OR SLEEP(3)--`, `' UNION SELECT 1,2,3--`) |
| 침해 계정 | `admin@shop.com` (role=admin) |
| 악성 행위 | `POST /admin/orders/cancel-all`, `GET /admin/export?table=users` |

## 4. 영향 범위

- **무결성**: `orders` 테이블 전체가 `total=0, product='CANCELLED'` 로 조작(WHERE 절 없는 대량 UPDATE).
- **기밀성**: `users` 테이블의 `email, password, phone` 유출(자격증명 + PII).
- **가용성**: 정상 주문 데이터 훼손으로 서비스 신뢰성 손상.
- 정상 사용자(`manager@shop.com`, 09:02)는 사고와 무관.

## 5. 대응 조치

- **봉쇄(Containment)**: 공격자 IP `203.0.113.66` 차단, admin 세션 즉시 무효화, `/admin/*` 임시 차단.
- **근절(Eradication)**: SQLi 취약점 패치(Prepared Statement — 4주차), admin 비밀번호 리셋,
  bcrypt 해시로 재저장(7주차).
- **복구(Recovery)**: 백업에서 `orders` 데이터 롤백, 유출 계정 강제 비밀번호 변경 공지.
- **증거 보존**: 3종 로그 + `timeline.csv` 원본 보존(무결성 해시 기록).

## 6. 재발 방지

- **입력 검증/쿼리**: Prepared Statement 전면 적용(4주차), 서버측 스키마 검증(5주차).
- **인증/저장**: 비밀번호 bcrypt, 민감정보(PII) AES-256-GCM 암호화(7주차).
- **접근통제/전송**: 관리자 기능 권한 검증·IDOR 방지, HTTPS+HSTS(8주차).
- **탐지**: IDS 룰로 SQLi/브루트포스 탐지(9주차), 관리자 대량 변경에 알림.
- **감사**: WHERE 절 없는 대량 UPDATE 차단·경보, 관리자 행위 로깅 강화(11주차).
