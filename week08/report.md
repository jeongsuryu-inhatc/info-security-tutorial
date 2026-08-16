# week08 — 전자상거래보안 Before/After 리포트

> 대상: `starter/shopguard-app` 주문/결제 API + HTTPS 전환
> 산출: `orders.js`(수정본), `server-secure.js`(HTTPS+helmet)

## 1. IDOR (권한 우회)

### Before — 공격 성공
소유자 검증이 없어 주문 ID만 바꾸면 남의 주문 조회.
```bash
curl -s localhost:3000/orders/2      # bob(user_id=3)의 주문이 그대로 노출
```

### After — 차단 (실측)
요청자(`x-user-id`)와 주문 `user_id` 대조, 불일치 시 404(존재 은닉).
```bash
curl -sk -o /dev/null -w "%{http_code}\n" -H 'x-user-id: 2' https://localhost:3443/orders/2  # → 404 (남의 주문)
curl -sk -o /dev/null -w "%{http_code}\n" -H 'x-user-id: 2' https://localhost:3443/orders/1  # → 200 (내 주문)
```

## 2. 가격 조작

### Before — 공격 성공
클라이언트가 보낸 `total` 을 서버가 그대로 신뢰.
```bash
curl -s -X POST localhost:3000/orders -H 'content-type: application/json' \
  -d '{"product":"노트북","total":10}'      # → 노트북(정가 150만)을 10원에 주문
```

### After — 차단 (실측)
클라이언트 `total` 무시, 서버가 `products` 가격으로 재계산.
```bash
curl -sk -X POST https://localhost:3443/orders -H 'content-type: application/json' \
  -H 'x-user-id: 2' -d '{"product":"노트북","total":10}'
# → {"id":...,"product":"노트북","quantity":1,"total":1500000}   (서버 재계산)
```

## 3. HTTPS + 보안 헤더 (실측)

`server-secure.js` — TLS(3443) + `helmet()` + HTTP→HTTPS 리다이렉트.
```bash
curl -skI https://localhost:3443/ | grep -Ei 'strict-transport|x-frame|x-content|content-security'
```
확인된 헤더:
- `Content-Security-Policy: default-src 'self'; …`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`

HTTP(3000) 접속 → **301 리다이렉트** → HTTPS(3443). (평문 접속 차단)

## 4. TLS 점검 (testssl / SSL Labs)

- 로컬은 **자체 서명 인증서**라 신뢰체인 경고가 정상(개발용). 실서비스는 CA 발급 인증서 사용.
- 점검 관점: TLS 1.2+ 만 허용, 약한 cipher/프로토콜(SSLv3/TLS1.0) 비활성, HSTS preload, 인증서 만료·체인 정합.
- 공개 쇼핑몰 1곳을 SSL Labs 로 점검해 **등급(A~F)** 과 개선점(HSTS, 구버전 TLS, cipher)을 비교 분석.

## 5. 원리 요약

| 취약점 | 근본 원인 | 근본 대책 |
|---|---|---|
| IDOR | 클라이언트 식별자를 **권한**으로 신뢰 | 서버측 소유자/권한 검증 |
| 가격 조작 | 클라이언트 값을 **진실**로 신뢰 | 가격의 출처는 항상 **서버 DB** |
| 전송 도청 | 평문 HTTP | HTTPS+HSTS |

> 공통 교훈: **클라이언트가 보낸 것은 신뢰하지 않는다.** 권한·가격은 서버가 결정한다.
