// week07/migrate-bcrypt.js — 과제 1: 평문 비밀번호 → bcrypt 해시 마이그레이션
//
// 실행 위치: starter/shopguard-app/ (여기에 복사한 뒤 실행해야 ./db, bcrypt 가 잡힌다)
//   cp week07/migrate-bcrypt.js starter/shopguard-app/
//   cd starter/shopguard-app && npm install bcrypt && npm run seed && node migrate-bcrypt.js
//
// 특징
//   - 멱등(idempotent): 이미 bcrypt 해시($2a$/$2b$/$2y$)인 행은 건너뛴다.
//     여러 번 실행해도 이중 해싱되지 않는다.
//   - cost 10 vs 12 해싱 시간을 측정해 출력한다(보고서용).
const bcrypt = require('bcrypt');
const { openDb } = require('./db');

// bcrypt 해시는 항상 $2a$/$2b$/$2y$ 로 시작한다. 이 접두사면 이미 변환된 것.
const BCRYPT_RE = /^\$2[aby]\$/;
const COST = 12; // 실제 저장에 쓸 cost(작업계수). 10~12 권장.

function migrate() {
  const db = openDb();
  try {
    const users = db.prepare('SELECT id, email, password FROM users').all();
    const update = db.prepare('UPDATE users SET password = ? WHERE id = ?');

    let migrated = 0;
    let skipped = 0;

    // 여러 행을 한 트랜잭션으로 묶어 원자적으로 처리(중간 실패 시 롤백).
    const runAll = db.transaction((rows) => {
      for (const u of rows) {
        if (BCRYPT_RE.test(u.password)) {
          skipped++; // 이미 해시 → 건너뜀(멱등성)
          continue;
        }
        const hash = bcrypt.hashSync(u.password, COST);
        update.run(hash, u.id);
        migrated++;
        console.log(`  변환: ${u.email} -> ${hash.slice(0, 10)}...`);
      }
    });
    runAll(users);

    console.log(`\n마이그레이션 완료: 변환 ${migrated}건, 건너뜀(이미 해시) ${skipped}건`);
  } finally {
    db.close();
  }
}

// cost 10 vs 12 해싱 시간 측정(보고서용). 실제 마이그레이션과 별개.
function benchmarkCost() {
  const sample = 'benchmark-password-1234';
  for (const cost of [10, 12]) {
    const t0 = process.hrtime.bigint();
    bcrypt.hashSync(sample, cost);
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    console.log(`  cost ${cost}: ${ms.toFixed(1)} ms / 해시`);
  }
}

console.log('== bcrypt cost 벤치마크 ==');
benchmarkCost();
console.log('\n== 비밀번호 마이그레이션 ==');
migrate();
