// grade-week06.cjs — 6주차 시그니처 스캐너 자동채점 (CLI 방식)
// 사용: node grading/grade-week06.cjs [scanner.js_경로]
//   기본 대상: solutions/shopguard-app-secure/scanner.js (모범답안 자가점검)
// 학생 스캐너는 `node scanner.js <폴더>` 형태로 폴더를 스캔하고 결과를 stdout 에 출력한다고 가정.
const { runChecks, path, fs } = require('./lib.cjs');
const os = require('os');
const { execFileSync } = require('child_process');

const scanner = path.resolve(process.argv[2] || process.env.SUBMISSION_DIR ||
  path.join(__dirname, '..', 'solutions/shopguard-app-secure/scanner.js'));
if (!fs.existsSync(scanner)) throw new Error(`scanner 없음: ${scanner}`);

// 테스트 폴더 구성: EICAR + eval(atob) + 정상 파일
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wk6-'));
fs.writeFileSync(path.join(tmp, 'eicar.com'),
  'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*');
fs.writeFileSync(path.join(tmp, 'malware.js'), 'eval(atob("YWxlcnQoMSk="))');
fs.writeFileSync(path.join(tmp, 'clean.txt'), '평범한 정상 파일');

function run() {
  try {
    return execFileSync('node', [scanner, tmp], { cwd: path.dirname(scanner) }).toString();
  } catch (e) {
    // 탐지 시 비정상 종료코드를 쓰는 스캐너도 있으므로 stdout 을 회수
    return (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
  }
}
const out = run().toLowerCase();

const checks = [
  { name: 'EICAR 해시 탐지', points: 12, fn: () =>
      ({ pass: out.includes('eicar') || out.includes('275a021b'), note: '' }) },
  { name: '문자열 룰(eval(atob) 등) 탐지', points: 8, fn: () =>
      ({ pass: out.includes('malware.js') || out.includes('atob') || out.includes('js-eval'), note: '' }) },
  { name: '정상 파일 오탐 없음', points: 5, fn: () =>
      ({ pass: !out.includes('clean.txt'), note: out.includes('clean.txt') ? 'clean.txt 오탐' : '' }) },
];

const { earned, max } = runChecks(`6주차 자동채점 (scanner: ${scanner})`, checks);
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(earned === max ? 0 : 1);
