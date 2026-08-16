// aes.js — 7주차 모범답안 (AES-256-GCM)
// 키는 환경변수 SHOPGUARD_KEY(32바이트 hex, 64자)로 주입한다. 하드코딩 금지.
//   예) export SHOPGUARD_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
const crypto = require('crypto');

function getKey() {
  const hex = process.env.SHOPGUARD_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('SHOPGUARD_KEY(32바이트 hex) 환경변수가 필요합니다');
  }
  return Buffer.from(hex, 'hex');
}

// 반환: iv:tag:ciphertext (모두 hex, ':' 구분)
function encrypt(plaintext) {
  const iv = crypto.randomBytes(12); // GCM 권장 96-bit, 매번 랜덤
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const ct = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('hex'), tag.toString('hex'), ct.toString('hex')].join(':');
}

function decrypt(blob) {
  const [ivHex, tagHex, ctHex] = String(blob).split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(ctHex, 'hex')), decipher.final()]).toString('utf8');
}

module.exports = { encrypt, decrypt };
