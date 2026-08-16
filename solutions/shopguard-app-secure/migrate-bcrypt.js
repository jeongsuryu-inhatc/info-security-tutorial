// migrate-bcrypt.js — 7주차 모범답안
// users.password 의 평문을 bcrypt 해시로 일괄 변환한다 (멱등: 이미 해시면 건너뜀).
// 실행: node migrate-bcrypt.js  (shopguard-app 디렉터리에서)
const { openDb } = require('./db');
const bcrypt = require('bcrypt');

const COST = 12; // work factor

function isHashed(v) {
  return typeof v === 'string' && v.startsWith('$2');
}

function migrate() {
  const db = openDb();
  const rows = db.prepare('SELECT id, password FROM users').all();
  const upd = db.prepare('UPDATE users SET password = ? WHERE id = ?');
  let changed = 0;
  const tx = db.transaction(() => {
    for (const r of rows) {
      if (isHashed(r.password)) continue;
      upd.run(bcrypt.hashSync(r.password, COST), r.id);
      changed++;
    }
  });
  tx();
  db.close();
  console.log(`migrated ${changed}/${rows.length} passwords (cost=${COST})`);
  return changed;
}

if (require.main === module) migrate();
module.exports = { migrate, isHashed };
