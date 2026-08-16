# ShopGuard (취약 스타터 앱)

4·5·7·8주차 공용 실습 앱이다. **의도적으로 취약**하게 만들어졌으니 학습용으로만 쓰고
실제 환경에 배포하지 않는다.

## 설치 · 실행

```bash
cd starter/shopguard-app
npm install          # better-sqlite3, express (+ bcrypt/helmet/zod 는 optional)
npm run seed         # shopguard.sqlite 생성 (평문 비밀번호 시드)
npm start            # http://localhost:3000
```

기본 계정: `admin@shop.com/root123`, `alice@shop.com/alice1234`, `bob@shop.com/bobpass`

## 파일별 실습 매핑

| 파일 | 취약점 | 실습 주차 |
|---|---|---|
| `auth.js` | SQL Injection | 4주차 (패치) · 7주차 (bcrypt) |
| `utils.js` | 경로순회·커맨드인젝션·프로토타입오염 | 5주차 |
| `routes/orders.js` | IDOR · 가격 조작 | 8주차 |
| `server.js` | 평문 HTTP · 보안 헤더 없음 | 8주차 (HTTPS+helmet) |
| `seed.js` | 평문 비밀번호 저장 | 7주차 (해시 마이그레이션) |
| `access.log` (생성됨) | — | 11주차 포렌식 입력 |

## 빠른 취약점 확인

```bash
# SQLi 인증 우회 (4주차)
curl -s -X POST localhost:3000/login \
  --data-urlencode "email=admin@shop.com'--" --data-urlencode "password=x"

# IDOR — 남의 주문 조회 (8주차)
curl -s localhost:3000/orders/1     # alice 주문을 아무나 조회

# 가격 조작 — 노트북을 10원에 주문 (8주차)
curl -s -X POST localhost:3000/orders \
  -H 'content-type: application/json' \
  -d '{"product":"노트북","total":10}'
```
