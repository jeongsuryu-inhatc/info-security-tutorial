// starter/malware-lab/scanner.example.js
// ---------------------------------------------------------------------------
// 6주차 과제 참고 구현 — Node.js 시그니처 스캐너.
//
// 학생은 이 파일을 그대로 베끼지 말고, 구조를 참고해 week06/scanner.js 를
// 직접 작성한다. 핵심 3요소: (1) 스트리밍 SHA-256 해시 매칭
// (2) 정규식 문자열 룰 (3) 심각도 포함 리포트.
//
// 실행: node scanner.example.js <스캔할_폴더> [rules.json 경로]
//   예: node scanner.example.js ./test-folder ./rules.json
// ---------------------------------------------------------------------------
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── 룰셋 로드 ────────────────────────────────────────────────
function loadRules(rulesPath) {
  const raw = fs.readFileSync(rulesPath, 'utf8');
  const rules = JSON.parse(raw);
  // 문자열 룰 정규식을 미리 컴파일(대소문자 무시).
  const stringRules = (rules.strings || []).map((r) => ({
    ...r,
    regex: new RegExp(r.pattern, 'i'),
  }));
  return { hashes: rules.hashes || {}, stringRules };
}

// ── 스트리밍 SHA-256 (대용량 파일도 메모리에 통째로 안 올림) ──
function sha256Stream(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

// ── 폴더 재귀 순회 → 파일 경로 목록 ─────────────────────────
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

// 문자열 룰은 텍스트/스크립트에만 의미가 있고 대용량 바이너리엔 오탐·부담이
// 크므로, 상한(기본 5MB)까지만 읽어 검사한다.
const MAX_STRING_SCAN_BYTES = 5 * 1024 * 1024;

async function scanFile(filePath, rules) {
  const findings = [];

  // (1) 해시 매칭
  const digest = await sha256Stream(filePath);
  if (rules.hashes[digest]) {
    const h = rules.hashes[digest];
    findings.push({
      type: 'hash',
      rule: h.name,
      severity: h.severity || 'medium',
      detail: `sha256=${digest}`,
    });
  }

  // (2) 문자열 룰
  const stat = fs.statSync(filePath);
  if (stat.size <= MAX_STRING_SCAN_BYTES) {
    const content = fs.readFileSync(filePath, 'latin1'); // 바이트 보존 읽기
    for (const r of rules.stringRules) {
      if (r.regex.test(content)) {
        findings.push({
          type: 'string',
          rule: r.id,
          severity: r.severity || 'low',
          detail: r.note || r.pattern,
        });
      }
    }
  }

  return findings;
}

// ── 리포트 ───────────────────────────────────────────────────
const SEV_ORDER = { high: 0, medium: 1, low: 2 };

async function main() {
  const target = process.argv[2];
  const rulesPath = process.argv[3] || path.join(__dirname, 'rules.json');
  if (!target) {
    console.error('usage: node scanner.example.js <folder> [rules.json]');
    process.exit(2);
  }

  const rules = loadRules(rulesPath);
  const files = walk(target);
  const report = [];

  for (const f of files) {
    const findings = await scanFile(f, rules);
    for (const finding of findings) {
      report.push({ file: f, ...finding });
    }
  }

  report.sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);

  // 사람이 읽는 표 + 기계가 읽는 JSON 둘 다 출력.
  console.log(`\n스캔 대상: ${target}  (파일 ${files.length}개, 탐지 ${report.length}건)\n`);
  for (const r of report) {
    console.log(`[${r.severity.toUpperCase()}] ${r.file}  (${r.type}:${r.rule}) — ${r.detail}`);
  }
  if (report.length === 0) console.log('탐지 없음(clean).');

  fs.writeFileSync(
    path.join(path.dirname(rulesPath), 'scan-report.json'),
    JSON.stringify(report, null, 2),
  );
  console.log(`\nJSON 리포트: scan-report.json`);

  // 탐지가 있으면 비정상 종료코드(CI 파이프라인 연동용).
  process.exit(report.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('scanner error:', err.message);
  process.exit(2);
});
