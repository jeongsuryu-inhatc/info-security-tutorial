// utils.js — 5주차 코드보안 실습 대상 (취약 유틸 3종)
//
// ⚠️ 세 함수 모두 입력 검증이 없어 취약하다. 5주차 과제에서 검증을 추가한다.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1) 경로 순회(Path Traversal)
//    readUpload('../../etc/passwd') 로 업로드 폴더 밖 파일을 읽을 수 있다.
function readUpload(name) {
  return fs.readFileSync(path.join(__dirname, 'uploads', name), 'utf8');
}

// 2) 커맨드 인젝션(Command Injection)
//    makeThumb('a.png; rm -rf /tmp/x') 로 임의 명령이 실행된다.
function makeThumb(file) {
  return execSync(`echo convert ${file} thumb.png`).toString();
}

// 3) 프로토타입 오염(Prototype Pollution)
//    merge({}, JSON.parse('{"__proto__":{"isAdmin":true}}')) 로 오염된다.
function merge(target, src) {
  for (const k in src) {
    if (typeof src[k] === 'object' && src[k] !== null) {
      target[k] = merge(target[k] || {}, src[k]);
    } else {
      target[k] = src[k];
    }
  }
  return target;
}

module.exports = { readUpload, makeThumb, merge };
