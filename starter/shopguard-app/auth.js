// auth.js — 로그인 인증 (4주차 SQLi 실습 대상 / 7주차 bcrypt 이관 대상)
//
// ⚠️ 취약 버전: 사용자 입력을 SQL 문자열에 직접 결합한다 (SQL Injection).
//    예) email = "admin@shop.com'--"  로 비밀번호 검사를 우회할 수 있다.
const { openDb } = require('./db');

function login(email, password) {
  const db = openDb();
  // 🚨 문자열 결합 — 절대 이렇게 하면 안 된다 (4주차에서 Prepared Statement로 교체)
  const sql = `SELECT id, email, role FROM users
               WHERE email = '${email}' AND password = '${password}'`;

  console.log('sql>');
  console.log(sql);
  
  try {
    const row = db.prepare(sql).get();
    return row || null;
  } finally {
    db.close();
  }
}

module.exports = { login };
