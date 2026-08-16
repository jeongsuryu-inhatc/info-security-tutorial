// week05/utils-test.js — 5주차 회귀 테스트 결과물
//
// 원칙: "악성 입력은 거부(throw), 정상 입력은 통과".
// 실행(앱 폴더에서): node --test utils-test.js
//   ※ utils-safe.js 와 uploads/product-101.txt 가 있는 위치에서 실행해야 한다
//     (zod 의존성과 업로드 기준 파일이 필요하기 때문).
const { test } = require('node:test');
const assert = require('node:assert');
const { readUpload, makeThumb, merge } = require('./utils-safe');

// ── 1) 경로 순회(Path Traversal) ─────────────────────────────
test('readUpload: 상위경로(../) 순회 거부', () => {
  assert.throws(() => readUpload('../../../etc/passwd'));
});

test('readUpload: 디렉터리 구분자(/, \\) 거부', () => {
  assert.throws(() => readUpload('sub/secret.txt'));
  assert.throws(() => readUpload('sub\\secret.txt'));
});

test('readUpload: 절대경로 거부', () => {
  assert.throws(() => readUpload('/etc/passwd'));
});

test('readUpload: 비문자열/빈 값 거부', () => {
  assert.throws(() => readUpload(''));
  assert.throws(() => readUpload(null));
  assert.throws(() => readUpload(123));
});

test('readUpload: 정상 파일명 통과', () => {
  assert.match(readUpload('product-101.txt'), /정상 업로드/);
});

// ── 2) 커맨드 인젝션(Command Injection) ──────────────────────
test('makeThumb: 세미콜론 명령 분리 거부', () => {
  assert.throws(() => makeThumb('a.png; id'));
});

test('makeThumb: 명령 치환($(), ``) 거부', () => {
  assert.throws(() => makeThumb('$(whoami).png'));
  assert.throws(() => makeThumb('`id`.png'));
});

test('makeThumb: 파이프/리다이렉트/공백 거부', () => {
  assert.throws(() => makeThumb('a.png | cat /etc/passwd'));
  assert.throws(() => makeThumb('a.png > /tmp/x'));
});

test('makeThumb: 정상 파일명 통과', () => {
  assert.match(makeThumb('photo_01.png'), /convert photo_01\.png thumb\.png/);
});

// ── 3) 프로토타입 오염(Prototype Pollution) ──────────────────
test('merge: __proto__ 오염 차단(전역 미오염)', () => {
  const o = {};
  merge(o, JSON.parse('{"__proto__":{"isAdmin":true}}'));
  assert.strictEqual({}.isAdmin, undefined); // 전역 Object.prototype 미오염
  assert.strictEqual(o.isAdmin, undefined);
});

test('merge: constructor.prototype 오염 차단', () => {
  const o = {};
  merge(o, JSON.parse('{"constructor":{"prototype":{"polluted":true}}}'));
  assert.strictEqual({}.polluted, undefined);
});

test('merge: 정상 병합(중첩 포함)', () => {
  assert.deepStrictEqual(
    merge({ a: 1 }, { b: 2, c: { d: 3 } }),
    { a: 1, b: 2, c: { d: 3 } },
  );
});
