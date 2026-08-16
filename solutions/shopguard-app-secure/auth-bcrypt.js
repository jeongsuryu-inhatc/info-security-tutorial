// auth-bcrypt.js — 7주차 모범답안 (bcrypt 검증 버전)
// 4주차 Prepared Statement 위에 bcrypt.compare 를 얹는다.
// migrate-bcrypt.js 로 DB를 먼저 마이그레이션한 뒤 사용한다.
const { openDb } = require('./db');
const bcrypt = require('bcrypt');

function login(email, password) {
  const db = openDb();
  try {
    const row = db
      .prepare('SELECT id, email, role, password FROM users WHERE email = ?')
      .get(email);
    if (!row) return null;
    if (!bcrypt.compareSync(password, row.password)) return null;
    return { id: row.id, email: row.email, role: row.role };
  } finally {
    db.close();
  }
}

module.exports = { login };
