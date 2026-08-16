// week05/utils-safe.js — 5주차 과제 결과물 (안전 버전)
//
// starter/shopguard-app/utils.js 의 취약 유틸 3종에 입력 검증을 추가한 버전이다.
// 원본과 동일하게 uploads/ 디렉터리 옆에서 동작하고 zod 스키마 검증을 쓰므로,
// 이 파일은 앱 폴더(starter/shopguard-app/) 컨텍스트에서 실행한다
// (require('zod') 해석과 uploads/ 접근이 필요하기 때문).
//
// 방어 요약
//   1) 경로 순회(Path Traversal)   : 파일명 스키마 검증 + 정규화 후 디렉터리 봉쇄(이중 방어)
//   2) 커맨드 인젝션(Command Inj.)  : execFileSync(셸 미사용) + 파일명 스키마 검증
//   3) 프로토타입 오염(Proto Pollu.): 위험 키(__proto__/constructor/prototype) 차단
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { z } = require('zod');

const UPLOAD_DIR = path.resolve(__dirname, 'uploads');

// 업로드 파일명 공통 스키마.
// - 디렉터리 구분자(/ \), 상위경로(..), 셸 메타문자(; | $ ` 공백 등)를
//   애초에 허용하지 않는 화이트리스트 방식이라, 경로 순회와 커맨드 인젝션을
//   같은 스키마 하나로 동시에 막는다. (블랙리스트 replace('..','') 는
//   '....//' 같은 우회가 가능하므로 지양 — 5주차 '흔한 오류' 참고)
const fileNameSchema = z
  .string()
  .min(1, '파일명이 비어 있음')
  .max(255, '파일명이 너무 김')
  .regex(/^[A-Za-z0-9._-]+$/, '허용되지 않은 문자 포함');

// 1) 경로 순회(Path Traversal) 방어
//    readUpload('../../../etc/passwd') → 스키마가 '/'와 '..'를 거부해 throw.
function readUpload(name) {
  const safeName = fileNameSchema.parse(name); // 악성 입력이면 ZodError throw

  // 이중 방어(defense-in-depth): 스키마를 통과했더라도 정규화한 최종 경로가
  // 업로드 디렉터리 바로 아래가 아니면 거부한다.
  const target = path.resolve(UPLOAD_DIR, safeName);
  if (path.dirname(target) !== UPLOAD_DIR) {
    throw new Error('path traversal blocked');
  }
  return fs.readFileSync(target, 'utf8');
}

// 2) 커맨드 인젝션(Command Injection) 방어
//    execSync(문자열)은 셸을 거쳐 ; | $() ` 등이 해석되지만,
//    execFileSync(파일, 인자배열)은 셸을 거치지 않아(shell:false 기본)
//    메타문자가 하나의 인자 '값'으로만 전달된다. 파일명도 스키마로 재검증.
function makeThumb(file) {
  const safeName = fileNameSchema.parse(file); // 악성 입력이면 ZodError throw
  // 실습 지시대로 echo 로 시연 — 실제로는 convert/ffmpeg 등을 execFile 로 호출.
  return execFileSync('echo', ['convert', safeName, 'thumb.png']).toString();
}

// 3) 프로토타입 오염(Prototype Pollution) 방어
//    JSON.parse('{"__proto__":{...}}') 는 '__proto__' 를 '자기 소유(own)'
//    열거 가능 키로 만들기 때문에 Object.keys 에 잡힌다. 위험 키를 건너뛴다.
//    (원본은 for..in 으로 순회하며 target['__proto__'] 에 대입해 오염됐다)
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
function merge(target, src) {
  for (const k of Object.keys(src)) {
    if (BLOCKED_KEYS.has(k)) continue; // 위험 키는 무시
    const value = src[k];
    if (value && typeof value === 'object') {
      const base =
        target[k] && typeof target[k] === 'object' ? target[k] : {};
      target[k] = merge(base, value);
    } else {
      target[k] = value;
    }
  }
  return target;
}

module.exports = { readUpload, makeThumb, merge, fileNameSchema };
