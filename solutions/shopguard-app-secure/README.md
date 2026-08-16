# ShopGuard 모범답안 (안전 버전)

4·5·6·7·8주차의 "안전 버전" 코드 모음이다. 스타터 앱(`starter/shopguard-app/`) 위에
**오버레이**해서 사용한다.

| 파일 | 주차 | 대응 취약 파일 |
|---|---|---|
| `auth.js` | 4 | Prepared Statement 로 SQLi 차단 |
| `auth-bcrypt.js` | 7 | bcrypt.compare 로그인 |
| `migrate-bcrypt.js` | 7 | 평문→bcrypt 마이그레이션 |
| `aes.js` | 7 | AES-256-GCM (키는 env) |
| `utils.js` + `utils.test.js` | 5 | 3종 취약점 검증 + 회귀 테스트 |
| `routes/orders.js` | 8 | IDOR·가격조작 차단 |
| `server-secure.js` | 8 | HTTPS + helmet |
| `scanner.js` + `rules.json` | 6 | 시그니처 스캐너 |

## 하니스 자가 점검용 적용

```bash
# 스타터 앱을 복사한 뒤 모범답안을 덮어써서 '만점 제출물'을 만든다
grading/apply-solution.sh /tmp/solved-app
cd /tmp/solved-app && npm install && npm run seed
node --test utils.test.js
node migrate-bcrypt.js
```
