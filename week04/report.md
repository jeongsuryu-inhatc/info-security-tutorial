# week04 — 웹보안 Before/After 리포트

> 대상: `starter/shopguard-app` (취약 로그인) + OWASP Juice Shop
> 상세 페이로드: `week04/exploits.md` 참조

## 1. SQL Injection

### Before — 공격 성공 (취약 `auth.js`)
취약 쿼리(실제 코드): `SELECT id, email, role FROM users WHERE email = '<E>' AND password = '<P>'`

| PoC | 입력(email) | 결과 |
|---|---|---|
| 인증 우회 | `admin@shop.com'--` | `AND password` 가 주석 처리 → **admin 로그인 성공(200)** |
| tautology | `' OR 1=1--` | 조건 항상 참 → 첫 행(admin) 반환 |
| UNION 추출 | `' UNION SELECT id, email, password FROM users WHERE role='admin'--` | 응답 `role` 필드에 **비밀번호 `root123` 유출** |

```bash
curl -s -X POST localhost:3000/login \
  --data-urlencode "email=admin@shop.com'--" --data-urlencode "password=x"
# {"ok":true,"user":{"id":1,"email":"admin@shop.com","role":"admin"}}
```

### After — 차단 (Prepared Statement)
`email` 만 바인딩하고, 저장된 해시를 `bcrypt.compareSync` 로 검증하도록 교체.
```js
const row = db.prepare('SELECT ... FROM users WHERE email = ?').get(email);
if (!row || !bcrypt.compareSync(password, row.password)) return null;
```
```bash
curl -s -X POST localhost:3000/login \
  --data-urlencode "email=admin@shop.com'--" --data-urlencode "password=x"   # → 401
```
→ 입력이 **값으로만** 취급되어 `'--`, `UNION` 이 리터럴 문자열이 됨. 우회·추출 모두 실패.

## 2. XSS (Juice Shop)

### Before — 반사형 XSS
검색창에 `<iframe src="javascript:alert('xss')">` 입력 → 스크립트 실행.

### After — 완화
- 출력 인코딩(HTML 이스케이프), `dangerouslySetInnerHTML`/`innerHTML` 지양.
- **CSP** 헤더로 인라인/외부 스크립트 제한(`script-src 'self'`).

## 3. 원리 요약

| 취약점 | 근본 원인 | 근본 대책 |
|---|---|---|
| SQLi | 사용자 입력을 SQL **코드로 해석** | 파라미터 바인딩(값/코드 분리) |
| XSS | 사용자 입력을 HTML/JS **코드로 렌더** | 출력 인코딩 + CSP |

> 공통 교훈: **데이터와 코드를 섞지 않는다.** 경계에서 입력을 값으로만 다룬다.
