// 3주차 평문 로그인 서버 (의존성 없이 Node 내장 http 만 사용)
// 로그인 자격증명이 HTTP 평문 POST 로 전송되어 Wireshark 로 그대로 보인다.
const http = require('http');
const { parse } = require('querystring');

const PORT = 80;

const FORM = `<!doctype html><meta charset="utf-8">
<h2>ShopGuard 로그인 (평문 HTTP)</h2>
<form method="POST" action="/login">
  <input name="username" placeholder="아이디"><br>
  <input name="password" type="password" placeholder="비밀번호"><br>
  <button>로그인</button>
</form>`;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/login') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const { username, password } = parse(body);
      // 평문 자격증명이 요청 본문에 그대로 실려 전송된다 (캡처 대상)
      console.log(`[LOGIN] username=${username} password=${password}`);
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(`환영합니다 ${username}`);
    });
    return;
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(FORM);
});

server.listen(PORT, () => console.log(`plaintext login server on :${PORT}`));
