// auth.js — 4주차 모범답안 (안전 버전)
// Prepared Statement(파라미터 바인딩)로 SQL Injection을 차단한다.
// (비밀번호 평문 비교는 7주차에서 bcrypt.compare 로 교체한다 → auth-bcrypt.js)
const { openDb } = require('./db');

function login(email, password) {
  const db = openDb();
  try {
    const row = db
      .prepare('SELECT id, email, role, password FROM users WHERE email = ?')
      .get(email); // 값은 항상 바인딩 — 문자열 결합 금지
    if (!row) return null;
    if (row.password !== password) return null;
    return { id: row.id, email: row.email, role: row.role };
  } finally {
    db.close();
  }
}

module.exports = { login };
