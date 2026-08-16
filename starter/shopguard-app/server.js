// server.js — ShopGuard 메인 서버 (HTTP)
//
// ⚠️ 취약 버전: HTTP(평문), 보안 헤더 없음, SQLi 로그인.
//    8주차에서 HTTPS + helmet 로 강화한다.
//    모든 요청은 access.log 로 남긴다 (11주차 포렌식 입력).
const express = require('express');
const fs = require('fs');
const path = require('path');
const { login } = require('./auth');
const orders = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG = path.join(__dirname, 'access.log');

// --- 접근 로그 (Apache combined 유사 포맷) ---
app.use((req, res, next) => {
  res.on('finish', () => {
    const line = `${req.ip} - - [${new Date().toISOString()}] ` +
      `"${req.method} ${req.originalUrl}" ${res.statusCode} ` +
      `"${req.header('user-agent') || '-'}"\n`;
    fs.appendFile(LOG, line, () => {});
  });
  next();
});

app.use(express.urlencoded({ extended: false }));

// --- 로그인 폼 (평문 GET/POST) ---
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
  const user = login(email, password); // 🚨 SQLi 취약
  if (user) res.json({ ok: true, user });
  else res.status(401).json({ ok: false, error: '인증 실패' });
});

// --- 주문/결제 API (IDOR·가격조작 취약) ---
app.use('/', orders);

app.get('/', (req, res) => res.send('ShopGuard (vulnerable) — /login 으로 이동'));

app.listen(PORT, () => console.log(`ShopGuard on http://localhost:${PORT}`));
