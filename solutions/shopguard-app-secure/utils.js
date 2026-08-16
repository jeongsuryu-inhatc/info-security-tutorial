// utils.js — 5주차 모범답안 (안전 버전)
// 세 함수 모두 입력 검증을 추가해 악성 입력을 거부한다.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const UPLOAD_DIR = path.join(__dirname, 'uploads');

// 1) 경로 순회 방어: 파일명만 허용하고 정규화 후 업로드 디렉터리 밖이면 거부
function readUpload(name) {
  if (typeof name !== 'string' || /[\\/]|\.\./.test(name)) {
    throw new Error('invalid file name');
  }
  const target = path.resolve(UPLOAD_DIR, path.basename(name));
  if (path.dirname(target) !== path.resolve(UPLOAD_DIR)) {
    throw new Error('path traversal blocked');
  }
  return fs.readFileSync(target, 'utf8');
}

// 2) 커맨드 인젝션 방어: 셸을 거치지 않는 execFile + 파일명 화이트리스트
const SAFE_NAME = /^[A-Za-z0-9._-]+$/;
function makeThumb(file) {
  if (!SAFE_NAME.test(file)) throw new Error('invalid file name');
  // 셸 해석이 없으므로 메타문자가 인자로만 전달된다 (여기선 echo로 시연)
  return execFileSync('echo', ['convert', file, 'thumb.png']).toString();
}

// 3) 프로토타입 오염 방어: 위험 키 차단
const BLOCKED = new Set(['__proto__', 'constructor', 'prototype']);
function merge(target, src) {
  for (const k of Object.keys(src)) {
    if (BLOCKED.has(k)) continue;
    if (src[k] && typeof src[k] === 'object') {
      target[k] = merge(target[k] && typeof target[k] === 'object' ? target[k] : {}, src[k]);
    } else {
      target[k] = src[k];
    }
  }
  return target;
}

module.exports = { readUpload, makeThumb, merge };
