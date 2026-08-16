// lib.cjs — 채점 공용 헬퍼
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

// 제출 앱 디렉터리 결정: 인자 > 환경변수 > 기본(starter 앱)
function resolveDir(defaultRel) {
  const d = process.argv[2] || process.env.SUBMISSION_DIR ||
    path.join(__dirname, '..', defaultRel || 'starter/shopguard-app');
  const abs = path.resolve(d);
  if (!fs.existsSync(abs)) throw new Error(`디렉터리 없음: ${abs}`);
  return abs;
}

function requireNodeModules(dir) {
  if (!fs.existsSync(path.join(dir, 'node_modules'))) {
    throw new Error(`node_modules 없음 — 먼저 '${dir}' 에서 npm install 하세요`);
  }
}

// seed.js 를 실행해 결정적 초기 DB 생성
function seed(dir) {
  execFileSync('node', ['seed.js'], { cwd: dir, stdio: 'ignore' });
}

// 학생 모듈을 캐시 없이 로드 (연속 채점 시 상태 격리)
function freshRequire(p) {
  delete require.cache[require.resolve(p)];
  return require(p);
}

// 체크 목록 실행 + 점수 집계
function runChecks(title, checks) {
  let earned = 0, max = 0;
  console.log(`\n=== ${title} ===`);
  for (const c of checks) {
    max += c.points;
    let pass = false, note = '';
    try {
      const r = c.fn();
      pass = r === true || (r && r.pass === true);
      note = (r && r.note) || '';
    } catch (e) {
      pass = false;
      note = e.message;
    }
    if (pass) earned += c.points;
    console.log(`  [${pass ? 'PASS' : 'FAIL'}] (${pass ? c.points : 0}/${c.points}) ${c.name}${note ? '  — ' + note : ''}`);
  }
  console.log(`  ── 자동채점 소계: ${earned}/${max}`);
  return { earned, max };
}

module.exports = { resolveDir, requireNodeModules, seed, freshRequire, runChecks, path, fs };
