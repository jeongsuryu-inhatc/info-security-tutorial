// grade-week05.cjs — 5주차 입력검증 자동채점
// 사용: node grading/grade-week05.cjs [제출_shopguard-app_경로]
const { resolveDir, freshRequire, runChecks, path, fs } = require('./lib.cjs');

const dir = resolveDir('starter/shopguard-app');

// 정상 파일 보장
const up = path.join(dir, 'uploads');
if (!fs.existsSync(up)) fs.mkdirSync(up, { recursive: true });
const legit = path.join(up, 'product-101.txt');
if (!fs.existsSync(legit)) fs.writeFileSync(legit, '정상 업로드 파일');

// uploads 밖(부모 디렉터리)에 민감 센티넬 파일 배치 — 취약 코드는 이걸 읽어낸다
const SECRET = 'TOP-SECRET-SENTINEL-9f3a';
const secretPath = path.join(dir, 'grader-secret.txt');
fs.writeFileSync(secretPath, SECRET);

const { readUpload, makeThumb, merge } = freshRequire(path.join(dir, 'utils.js'));

function throws(fn) { try { fn(); return false; } catch { return true; } }
// 센티넬 내용을 읽어내면 취약(traversal 성공) — 예외를 던지거나 내용을 반환하지 않아야 안전
function cannotLeak(arg) {
  try { return !String(readUpload(arg)).includes(SECRET); }
  catch { return true; }
}

const checks = [
  { name: 'readUpload: 경로순회 거부(센티넬 유출 없음)', points: 8, fn: () =>
      cannotLeak('../grader-secret.txt') && cannotLeak('../../grader-secret.txt') &&
      throws(() => readUpload('a/b.txt')) },
  { name: 'readUpload: 정상 파일 통과', points: 4, fn: () =>
      /정상 업로드/.test(readUpload('product-101.txt')) },
  { name: 'makeThumb: 메타문자 파일명 거부', points: 8, fn: () =>
      throws(() => makeThumb('a.png; id')) && throws(() => makeThumb('$(whoami).png')) },
  { name: 'makeThumb: 정상 파일명 통과', points: 3, fn: () => {
      const out = makeThumb('photo_01.png'); return typeof out === 'string'; } },
  { name: 'merge: 프로토타입 오염 차단', points: 7, fn: () => {
      const o = {}; merge(o, JSON.parse('{"__proto__":{"isAdmin":true}}'));
      const polluted = ({}).isAdmin === true;
      delete Object.prototype.isAdmin; // 정리
      return { pass: !polluted, note: polluted ? '전역 오염됨(취약)' : '' };
    } },
];

const { earned, max } = runChecks(`5주차 자동채점 (대상: ${dir})`, checks);
try { fs.unlinkSync(secretPath); } catch { /* noop */ }
process.exit(earned === max ? 0 : 1);
