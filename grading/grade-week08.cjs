// grade-week08.cjs — 8주차 IDOR·가격조작 수정 자동채점
// 사용: node grading/grade-week08.cjs [제출_shopguard-app_경로]
// 학생의 routes/orders.js 를 express 앱에 마운트해 HTTP 로 검증한다.
const { resolveDir, requireNodeModules, seed, freshRequire, runChecks, path } = require('./lib.cjs');

(async () => {
  const dir = resolveDir('starter/shopguard-app');
  requireNodeModules(dir);
  seed(dir);

  const express = freshRequire(path.join(dir, 'node_modules', 'express'));
  const orders = freshRequire(path.join(dir, 'routes', 'orders.js'));

  const app = express();
  app.use('/', orders);
  const server = await new Promise((res) => { const s = app.listen(0, () => res(s)); });
  const base = `http://localhost:${server.address().port}`;

  // 시드: orders id1=alice(user2), id2=bob(user3). products 노트북=1500000
  async function get(p, uid) {
    const r = await fetch(base + p, { headers: uid ? { 'x-user-id': String(uid) } : {} });
    return { status: r.status, body: await r.json().catch(() => ({})) };
  }
  async function post(p, uid, body) {
    const r = await fetch(base + p, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(uid ? { 'x-user-id': String(uid) } : {}) },
      body: JSON.stringify(body),
    });
    return { status: r.status, body: await r.json().catch(() => ({})) };
  }

  const ownOrder = await get('/orders/1', 2); // alice 본인 주문
  const otherOrder = await get('/orders/2', 2); // bob 주문을 alice 가 조회 → 차단돼야 함
  const priceOrder = await post('/orders', 2, { product: '노트북', total: 10 });

  const checks = [
    { name: '본인 주문 조회 허용', points: 8, fn: () =>
        ({ pass: ownOrder.status === 200, note: `status=${ownOrder.status}` }) },
    { name: 'IDOR 차단(남의 주문 403/404)', points: 12, fn: () =>
        ({ pass: otherOrder.status === 403 || otherOrder.status === 404,
           note: otherOrder.status === 200 ? '남의 주문 노출(취약)' : `status=${otherOrder.status}` }) },
    { name: '가격 조작 차단(서버 재계산)', points: 15, fn: () => {
        const t = priceOrder.body && priceOrder.body.total;
        return { pass: t === 1500000, note: t === 10 ? '클라이언트 total 신뢰(취약)' : `total=${t}` };
      } },
  ];

  const { earned, max } = runChecks(`8주차 자동채점 (대상: ${dir})`, checks);
  server.close();
  process.exit(earned === max ? 0 : 1);
})();
