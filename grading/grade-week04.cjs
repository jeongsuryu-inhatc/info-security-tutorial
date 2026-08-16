// grade-week04.cjs — 4주차 SQLi 패치 자동채점
// 사용: node grading/grade-week04.cjs [제출_shopguard-app_경로]
//   기본 대상: starter/shopguard-app (grading/apply-solution.sh 로 모범답안 적용 후 자가점검 가능)
const { resolveDir, requireNodeModules, seed, freshRequire, runChecks, path } = require('./lib.cjs');

const dir = resolveDir('starter/shopguard-app');
requireNodeModules(dir);
seed(dir); // 평문 시드로 초기화 (4주차는 마이그레이션 전 상태)

const { login } = freshRequire(path.join(dir, 'auth.js'));

const checks = [
  { name: '정상 로그인 성공(alice)', points: 8, fn: () => {
      const u = login('alice@shop.com', 'alice1234');
      return { pass: !!u && u.email === 'alice@shop.com', note: u ? '' : 'null 반환' };
    } },
  { name: '틀린 비밀번호 거부', points: 7, fn: () => login('alice@shop.com', 'wrong') === null },
  { name: "SQLi 주석 우회 차단 (admin@shop.com'--)", points: 10, fn: () => {
      const u = login("admin@shop.com'--", 'anything');
      return { pass: u === null, note: u ? '우회 성공(취약)' : '' };
    } },
  { name: "SQLi 항진명제 차단 (' OR '1'='1)", points: 10, fn: () => {
      const u = login("x' OR '1'='1", "x' OR '1'='1");
      return { pass: u === null, note: u ? '우회 성공(취약)' : '' };
    } },
];

const { earned, max } = runChecks(`4주차 자동채점 (대상: ${dir})`, checks);
process.exit(earned === max ? 0 : 1);
