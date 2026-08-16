// server-secure.js — 8주차 모범답안 (HTTPS + helmet + 안전 라우터)
// 사전: mkcert localhost 127.0.0.1  → localhost.pem, localhost-key.pem
//       npm install helmet
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const { login } = require('./auth');       // 4주차 안전 버전 (7주차엔 auth-bcrypt)
const orders = require('./routes/orders');  // 8주차 안전 버전

const app = express();
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const HTTP_PORT = process.env.HTTP_PORT || 3000;
const LOG = path.join(__dirname, 'access.log');

app.use(helmet()); // HSTS, X-Frame-Options, X-Content-Type-Options, CSP 등 일괄
app.use((req, res, next) => {
  res.on('finish', () => {
    fs.appendFile(LOG,
      `${req.ip} - - [${new Date().toISOString()}] "${req.method} ${req.originalUrl}" ${res.statusCode}\n`,
      () => {});
  });
  next();
});
app.use(express.urlencoded({ extended: false }));

app.post('/login', (req, res) => {
  const user = login(req.body.email, req.body.password);
  return user ? res.json({ ok: true, user }) : res.status(401).json({ ok: false });
});
app.use('/', orders);
app.get('/', (req, res) => res.send('ShopGuard (secure)'));

// HTTP → HTTPS 강제 리다이렉트
http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://localhost:${HTTPS_PORT}${req.url}` });
  res.end();
}).listen(HTTP_PORT);

https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'localhost.pem')),
}, app).listen(HTTPS_PORT, () => console.log(`secure on https://localhost:${HTTPS_PORT}`));
