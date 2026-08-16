// week08/orders.js — 과제 1: 주문/결제 API 취약점 수정본
//
// 배치 위치: starter/shopguard-app/routes/orders.js 를 이 내용으로 교체.
//   cp week08/orders.js starter/shopguard-app/routes/orders.js
//
// 수정한 취약점 2종:
//   1) IDOR       : 주문 조회 시 요청자(x-user-id)와 주문 소유자(user_id)를 대조.
//                   남의 주문이면 404(존재 자체를 숨김 — 열거 방지).
//   2) 가격 조작   : 클라이언트가 보낸 total 을 무시하고, 서버가 products 테이블의
//                   가격으로 총액을 재계산한다(가격의 출처는 항상 서버 DB).
const express = require('express');
const { openDb } = require('../db');

const router = express.Router();

// 데모용 "현재 로그인 사용자" — 실제로는 세션/JWT에서 와야 한다.
// 헤더 x-user-id 로 흉내낸다 (alice=2, bob=3).
function currentUserId(req) {
  return parseInt(req.header('x-user-id') || '2', 10);
}

// ✅ IDOR 방어: 주문 소유자만 조회할 수 있다.
router.get('/orders/:id', (req, res) => {
  const db = openDb();
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    // 존재하지 않거나(404) 내 주문이 아니면(404로 통일 — 주문 존재 여부 노출 방지)
    if (!order || order.user_id !== currentUserId(req)) {
      return res.status(404).json({ error: 'not found' });
    }
    res.json(order);
  } finally {
    db.close();
  }
});

// ✅ 가격 조작 방어: 클라이언트 total 무시, 서버가 products 가격으로 재계산.
router.post('/orders', express.json(), (req, res) => {
  const { product } = req.body;
  // 수량은 정수로 강제하고 1 이상만 허용(음수/소수/문자 차단).
  const quantity = Math.trunc(Number(req.body.quantity ?? 1));

  if (typeof product !== 'string' || product.trim() === '') {
    return res.status(400).json({ error: 'product 필드가 필요합니다.' });
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'quantity 는 1 이상의 정수여야 합니다.' });
  }

  const db = openDb();
  try {
    // 🔑 가격의 출처는 항상 서버 DB. 클라이언트가 보낸 값은 쓰지 않는다.
    const row = db.prepare('SELECT price FROM products WHERE name = ?').get(product);
    if (!row) {
      return res.status(400).json({ error: '존재하지 않는 상품입니다.' });
    }
    const total = row.price * quantity; // 서버가 재계산한 총액

    const info = db
      .prepare(
        'INSERT INTO orders (user_id, product, total, created) VALUES (?, ?, ?, ?)',
      )
      .run(
        currentUserId(req),
        product,
        total,
        new Date('2026-08-15T00:00:00Z').toISOString(),
      );
    res.status(201).json({ id: info.lastInsertRowid, product, quantity, total });
  } finally {
    db.close();
  }
});

module.exports = router;
