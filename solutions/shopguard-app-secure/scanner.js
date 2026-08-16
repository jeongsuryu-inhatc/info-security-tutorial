// scanner.js — 6주차 모범답안 (시그니처 스캐너)
// 실행: node scanner.js <폴더> [--rules rules.json]
//   해시 매칭 + 문자열 룰로 탐지하고 결과를 표로 출력한다.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function loadRules(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

function scan(dir, rulesPath) {
  const rules = loadRules(rulesPath);
  const findings = [];
  for (const file of walk(dir)) {
    const hash = sha256(file);
    if (rules.hashes[hash]) {
      findings.push({ file, rule: `hash:${rules.hashes[hash].name}`, severity: rules.hashes[hash].severity });
    }
    let content = '';
    try { content = fs.readFileSync(file, 'utf8'); } catch { /* binary */ }
    for (const r of rules.strings) {
      if (new RegExp(r.pattern).test(content)) {
        findings.push({ file, rule: `str:${r.id}`, severity: r.severity });
      }
    }
  }
  return findings;
}

if (require.main === module) {
  const dir = process.argv[2] || '.';
  const rulesPath = process.argv.includes('--rules')
    ? process.argv[process.argv.indexOf('--rules') + 1]
    : path.join(__dirname, 'rules.json');
  const findings = scan(dir, rulesPath);
  if (!findings.length) console.log('탐지 없음');
  for (const f of findings) console.log(`[${f.severity.toUpperCase()}] ${f.file}  (${f.rule})`);
  console.log(`\n총 ${findings.length}건 탐지`);
}

module.exports = { scan, sha256 };
