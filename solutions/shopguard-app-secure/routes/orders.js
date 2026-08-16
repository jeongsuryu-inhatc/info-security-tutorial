// routes/orders.js — 8주차 모범답안 (안전 버전)
//   - IDOR 차단: 주문 소유자(user_id)와 현재 사용자를 대조
//   - 가격 조작 차단: 클라이언트 total 을 무시하고 서버가 DB 가격으로 재계산
const express = require('express');
const { openDb } = require('../db');

const router = express.Router();

function currentUserId(req) {
  return parseInt(req.header('x-user-id') || '2', 10);
}

// 접근 통제: 본인 주문만 조회 가능
router.get('/orders/:id', (req, res) => {
  const db = openDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  db.close();
  if (!order) return res.status(404).json({ error: 'not found' });
  if (order.user_id !== currentUserId(req)) {
    return res.status(403).json({ error: 'forbidden' }); // 남의 주문 차단
  }
  res.json(order);
});

// 가격은 서버가 상품 카탈로그에서 조회해 재계산
router.post('/orders', express.json(), (req, res) => {
  const { product, qty = 1 } = req.body;
  const quantity = Number.isInteger(qty) && qty > 0 ? qty : 1;
  const db = openDb();
  const p = db.prepare('SELECT price FROM products WHERE name = ?').get(product);
  if (!p) {
    db.close();
    return res.status(400).json({ error: 'unknown product' });
  }
  const total = p.price * quantity; // 클라이언트 total 무시
  const info = db.prepare(
    'INSERT INTO orders (user_id, product, total, created) VALUES (?, ?, ?, ?)'
  ).run(currentUserId(req), product, total, new Date('2026-08-15T00:00:00Z').toISOString());
  db.close();
  res.status(201).json({ id: info.lastInsertRowid, product, qty: quantity, total });
});

module.exports = router;
