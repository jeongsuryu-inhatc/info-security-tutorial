// routes/orders.js — 주문/결제 API (8주차 IDOR·가격조작 실습 대상)
//
// ⚠️ 취약점 2종:
//   - IDOR: 주문 조회 시 소유자(user_id)를 검증하지 않는다.
//   - 가격 조작: 클라이언트가 보낸 total/price를 서버가 그대로 신뢰한다.
const express = require('express');
const { openDb } = require('../db');

const router = express.Router();

// 데모용 "현재 로그인 사용자" — 실제로는 세션에서 와야 한다.
// 헤더 x-user-id 로 흉내낸다 (alice=2, bob=3).
function currentUserId(req) {
  return parseInt(req.header('x-user-id') || '2', 10);
}

// 🚨 IDOR: 누구든 주문 ID만 바꾸면 남의 주문을 조회할 수 있다.
router.get('/orders/:id', (req, res) => {
  const db = openDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  db.close();
  if (!order) return res.status(404).json({ error: 'not found' });
  res.json(order); // 소유자 검증 없음
});

// 🚨 가격 조작: 클라이언트가 보낸 total을 그대로 저장한다.
router.post('/orders', express.json(), (req, res) => {
  const { product, total } = req.body; // total 을 신뢰 (취약)
  const db = openDb();
  const info = db.prepare(
    'INSERT INTO orders (user_id, product, total, created) VALUES (?, ?, ?, ?)'
  ).run(currentUserId(req), product, total, new Date('2026-08-15T00:00:00Z').toISOString());
  db.close();
  res.status(201).json({ id: info.lastInsertRowid, product, total });
});

module.exports = router;
