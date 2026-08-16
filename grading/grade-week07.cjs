// grade-week07.cjs — 7주차 bcrypt 마이그레이션 + AES 자동채점
// 사용: node grading/grade-week07.cjs [제출_shopguard-app_경로]
// 가정: 제출 앱에 migrate-bcrypt.js, (bcrypt 로그인으로 교체된) auth.js, aes.js 가 있다.
const { resolveDir, requireNodeModules, seed, freshRequire, runChecks, path, fs } = require('./lib.cjs');
const { execFileSync } = require('child_process');
const crypto = require('crypto');

const dir = resolveDir('starter/shopguard-app');
requireNodeModules(dir);
seed(dir);

// 마이그레이션 실행
let migrateNote = '';
try {
  execFileSync('node', ['migrate-bcrypt.js'], { cwd: dir, stdio: 'ignore' });
} catch (e) { migrateNote = 'migrate-bcrypt.js 실행 실패: ' + e.message; }

const Database = freshRequire(path.join(dir, 'node_modules', 'better-sqlite3'));
const db = new Database(path.join(dir, 'shopguard.sqlite'));
const rows = db.prepare('SELECT password FROM users').all();
db.close();

const checks = [
  { name: '평문 비밀번호 제거(전부 bcrypt 해시)', points: 15, fn: () => {
      if (migrateNote) return { pass: false, note: migrateNote };
      const allHashed = rows.every((r) => /^\$2[aby]\$/.test(r.password));
      return { pass: allHashed, note: allHashed ? '' : '평문 잔존' };
    } },
  { name: 'bcrypt 로그인 동작(alice)', points: 10, fn: () => {
      const { login } = freshRequire(path.join(dir, 'auth.js'));
      const u = login('alice@shop.com', 'alice1234');
      return { pass: !!u && u.email === 'alice@shop.com',
               note: u ? '' : 'auth.js 가 bcrypt.compare 로 교체되지 않았을 수 있음' };
    } },
  { name: 'AES 왕복 암복호화', points: 8, fn: () => {
      process.env.SHOPGUARD_KEY = crypto.randomBytes(32).toString('hex');
      const aes = freshRequire(path.join(dir, 'aes.js'));
      const blob = aes.encrypt('010-1234-5678');
      return { pass: aes.decrypt(blob) === '010-1234-5678', note: '' };
    } },
  { name: 'AES 인증태그 변조 감지', points: 7, fn: () => {
      process.env.SHOPGUARD_KEY = process.env.SHOPGUARD_KEY || crypto.randomBytes(32).toString('hex');
      const aes = freshRequire(path.join(dir, 'aes.js'));
      const blob = aes.encrypt('secret');
      // iv:tag:ct 형식 가정 — tag 1글자 변조
      const parts = blob.split(':');
      if (parts.length >= 2) {
        parts[1] = (parts[1][0] === 'a' ? 'b' : 'a') + parts[1].slice(1);
      }
      let threw = false;
      try { aes.decrypt(parts.join(':')); } catch { threw = true; }
      return { pass: threw, note: threw ? '' : '변조를 감지 못함(형식 상이 가능 — 수동 확인)' };
    } },
];

const { earned, max } = runChecks(`7주차 자동채점 (대상: ${dir})`, checks);
process.exit(earned === max ? 0 : 1);
