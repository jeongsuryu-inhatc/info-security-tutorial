// utils.test.js — 5주차 회귀 테스트 (모범답안)
// 실행: node --test utils.test.js   (안전 버전 utils.js 옆에 두고 실행)
const { test } = require('node:test');
const assert = require('node:assert');
const { readUpload, makeThumb, merge } = require('./utils');

test('readUpload: 경로 순회 거부', () => {
  assert.throws(() => readUpload('../../../etc/passwd'));
  assert.throws(() => readUpload('sub/dir.txt'));
});

test('readUpload: 정상 파일 통과', () => {
  assert.match(readUpload('product-101.txt'), /정상 업로드/);
});

test('makeThumb: 메타문자 포함 파일명 거부', () => {
  assert.throws(() => makeThumb('a.png; id'));
  assert.throws(() => makeThumb('$(whoami).png'));
});

test('makeThumb: 정상 파일명 통과', () => {
  assert.match(makeThumb('photo_01.png'), /convert/);
});

test('merge: 프로토타입 오염 차단', () => {
  const o = {};
  merge(o, JSON.parse('{"__proto__":{"isAdmin":true}}'));
  assert.strictEqual({}.isAdmin, undefined); // 전역 오염 없음
});

test('merge: 정상 병합', () => {
  assert.deepStrictEqual(merge({ a: 1 }, { b: 2 }), { a: 1, b: 2 });
});
