// week07/aes.js — 과제 2: 민감정보(전화번호) AES-256-GCM 암복호화
//
// 실행 위치: starter/shopguard-app/ (여기에 복사해 쓰면 자동채점·다른 모듈에서 require 가능)
//   cp week07/aes.js starter/shopguard-app/
//   cd starter/shopguard-app
//   export SHOPGUARD_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
//   node -e "const a=require('./aes'); const b=a.encrypt('010-1234-5678'); console.log(b,'->',a.decrypt(b))"
//
// 설계 원칙
//   - 키는 하드코딩 금지 → 환경변수 SHOPGUARD_KEY(64 hex = 32 byte)로 주입.
//   - IV(nonce)는 매 암호화마다 12바이트 랜덤 생성(GCM에서 IV 재사용은 치명적).
//   - 저장 포맷은 iv:tag:ciphertext (모두 base64) 한 문자열 → DB 한 컬럼에 저장 가능.
//   - GCM 인증 태그로 무결성까지 보장(변조 시 decrypt 예외).
const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const IV_BYTES = 12; // GCM 권장 nonce 길이
const KEY_BYTES = 32; // AES-256

// 환경변수에서 키를 읽어 32바이트 Buffer로 변환. 없거나 길이가 틀리면 즉시 실패.
function loadKey() {
  const hex = process.env.SHOPGUARD_KEY;
  if (!hex) {
    throw new Error(
      'SHOPGUARD_KEY 환경변수가 없습니다. ' +
        'export SHOPGUARD_KEY=$(node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))")',
    );
  }
  const key = Buffer.from(hex, 'hex');
  if (key.length !== KEY_BYTES) {
    throw new Error(`SHOPGUARD_KEY 는 ${KEY_BYTES}바이트(hex ${KEY_BYTES * 2}자)여야 합니다. 현재 ${key.length}바이트`);
  }
  return key;
}

// 평문 → "iv:tag:ciphertext"(base64). 같은 입력이라도 IV가 매번 달라 결과가 달라진다.
function encrypt(plaintext) {
  const key = loadKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), ct.toString('base64')].join(':');
}

// "iv:tag:ciphertext" → 평문. 태그/암호문이 변조됐으면 final()에서 예외 발생.
function decrypt(packed) {
  const key = loadKey();
  const parts = String(packed).split(':');
  if (parts.length !== 3) throw new Error('잘못된 암호문 포맷(iv:tag:ciphertext 아님)');
  const [ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ct = Buffer.from(ctB64, 'base64');

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

module.exports = { encrypt, decrypt };

// 파일을 직접 실행하면(node aes.js) 간단한 자체 시연을 돌린다.
if (require.main === module) {
  const sample = '010-1234-5678';
  const enc = encrypt(sample);
  console.log('평문   :', sample);
  console.log('암호문 :', enc);
  console.log('복호화 :', decrypt(enc));

  // 무결성 시연: 인증 태그 1바이트를 뒤집으면 복호화가 예외로 실패한다.
  // (base64 문자열의 끝 글자는 패딩일 수 있어 실제 바이트가 안 바뀔 수 있으므로,
  //  태그를 디코드→비트 반전→재인코드 방식으로 확실하게 변조한다.)
  const [ivB64, tagB64, ctB64] = enc.split(':');
  const tag = Buffer.from(tagB64, 'base64');
  tag[0] ^= 0xff; // 태그 1바이트 변조
  const tampered = [ivB64, tag.toString('base64'), ctB64].join(':');
  try {
    decrypt(tampered);
    console.log('변조 감지 실패(예상과 다름)');
  } catch (e) {
    console.log('변조 감지 :', e.message);
  }
}
