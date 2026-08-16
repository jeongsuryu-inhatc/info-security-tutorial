// seed.js — 실습용 초기 데이터 생성
// 실행: npm run seed   (shopguard.sqlite 를 생성/초기화)
//
// ⚠️ 학습 목적: 비밀번호를 '평문'으로 저장한다. 7주차에서 bcrypt로 마이그레이션한다.
const { openDb, DB_PATH } = require('./db');
const fs = require('fs');

// 기존 DB 초기화
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
const db = openDb();

db.exec(`
  CREATE TABLE users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    email    TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,          -- ⚠️ 평문 (7주차에서 해시로 교체)
    phone    TEXT,                   -- 7주차 AES 암호화 대상
    role     TEXT NOT NULL DEFAULT 'user'
  );

  CREATE TABLE products (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL,
    price INTEGER NOT NULL           -- 원 단위 (8주차: 서버가 이 값을 신뢰해야 함)
  );

  CREATE TABLE orders (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER NOT NULL,       -- 8주차 IDOR: 소유자 검증 대상
    product  TEXT NOT NULL,
    total    INTEGER NOT NULL,
    created  TEXT NOT NULL
  );
`);

const insUser = db.prepare('INSERT INTO users (email, password, phone, role) VALUES (?, ?, ?, ?)');
insUser.run('admin@shop.com', 'root123',   '010-1111-2222', 'admin');
insUser.run('alice@shop.com', 'alice1234', '010-3333-4444', 'user');
insUser.run('bob@shop.com',   'bobpass',   '010-5555-6666', 'user');

const insProd = db.prepare('INSERT INTO products (name, price) VALUES (?, ?)');
insProd.run('노트북',   1500000);
insProd.run('마우스',   30000);
insProd.run('키보드',   80000);

const insOrder = db.prepare('INSERT INTO orders (user_id, product, total, created) VALUES (?, ?, ?, ?)');
insOrder.run(2, '마우스', 30000, '2026-08-01T10:00:00Z'); // alice의 주문
insOrder.run(3, '키보드', 80000, '2026-08-02T11:00:00Z'); // bob의 주문

console.log('seeded ->', DB_PATH);
console.log('계정: admin@shop.com/root123, alice@shop.com/alice1234, bob@shop.com/bobpass');
db.close();
