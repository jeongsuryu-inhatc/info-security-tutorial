// week08/server-secure.js — Lab 8-B / 과제 1: HTTPS(TLS) + helmet 보안 서버
//
// 배치 위치: starter/shopguard-app/server-secure.js (여기서 실행해야 ./auth, ./routes 가 잡힌다)
//   cp week08/server-secure.js starter/shopguard-app/
//
// 사전 준비: Step 5에서 만든 인증서/키가 앱 폴더에 있어야 한다.
//   # 자체 서명 인증서(개발용) — ssl.key(개인키), ssl.crt(인증서) 생성
//   openssl req -x509 -newkey rsa:2048 -nodes -keyout ssl.key -out ssl.crt \
//     -days 365 -subj "/CN=localhost"
//
// 실행:
//   cd starter/shopguard-app
//   npm install helmet
//   npm run seed
//   node server-secure.js               # https://localhost:3443
//
// 이 서버는 server.js 와 같은 라우터(./routes/orders)를 마운트하되,
//   (1) HTTPS(TLS)로 전송 구간 암호화
//   (2) helmet 으로 보안 헤더 일괄 적용
//   (3) HTTP(3000) 접속은 HTTPS(3443)로 리다이렉트
// 를 추가한 강화 버전이다. 취약점 수정(IDOR·가격조작)은 routes/orders.js 에서 이뤄진다.
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const { login } = require('./auth');
const orders = require('./routes/orders');

const app = express();
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const HTTP_PORT = process.env.PORT || 3000;
const LOG = path.join(__dirname, 'access.log');

// --- 보안 헤더 일괄 적용 (HSTS/X-Frame-Options/X-Content-Type-Options/CSP 등) ---
app.use(helmet());
// HSTS: HTTPS 강제(1년). 자체 서명 개발환경에서도 헤더 확인용으로 켠다.
app.use(
  helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }),
);

// --- 접근 로그 (Apache combined 유사 포맷, 11주차 포렌식 입력) ---
app.use((req, res, next) => {
  res.on('finish', () => {
    const line =
      `${req.ip} - - [${new Date().toISOString()}] ` +
      `"${req.method} ${req.originalUrl}" ${res.statusCode} ` +
      `"${req.header('user-agent') || '-'}"\n`;
    fs.appendFile(LOG, line, () => {});
  });
  next();
});

app.use(express.urlencoded({ extended: false }));

// --- 로그인 폼/처리 ---
app.get('/login', (req, res) => {
  res.type('html').send(`
    <form method="POST" action="/login">
      <input name="email" placeholder="email">
      <input name="password" type="password" placeholder="password">
      <button>로그인</button>
    </form>`);
});
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = login(email, password);
  if (user) res.json({ ok: true, user });
  else res.status(401).json({ ok: false, error: '인증 실패' });
});

// --- 주문/결제 API (routes/orders.js 의 수정본이 IDOR·가격조작을 막는다) ---
app.use('/', orders);

app.get('/', (req, res) => res.send('ShopGuard (secure) — https://localhost:3443'));

// --- HTTPS 서버 기동 (Step 5에서 만든 ssl.key/ssl.crt 사용) ---
const tlsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'ssl.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl.crt')),
};
https.createServer(tlsOptions, app).listen(HTTPS_PORT, () => {
  console.log(`ShopGuard (secure) on https://localhost:${HTTPS_PORT}`);
});

// --- HTTP → HTTPS 리다이렉트 (평문 접속 차단) ---
http
  .createServer((req, res) => {
    const host = (req.headers.host || `localhost:${HTTP_PORT}`).split(':')[0];
    res.writeHead(301, { Location: `https://${host}:${HTTPS_PORT}${req.url}` });
    res.end();
  })
  .listen(HTTP_PORT, () => {
    console.log(`HTTP ${HTTP_PORT} → HTTPS ${HTTPS_PORT} 리다이렉트`);
  });
