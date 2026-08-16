// 취약 IoT 기기 시뮬레이터 — 인증 없이 브로커에 민감 텔레메트리를 발행한다.
// 기본 계정(admin/admin)으로 원격 명령 토픽도 구독한다.
const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://broker:1883', {
  username: 'admin', password: 'admin', // ⚠️ 기본 계정
});

client.on('connect', () => {
  console.log('device connected (anonymous broker)');
  client.subscribe('shopguard/device/cmd');
  setInterval(() => {
    const payload = JSON.stringify({
      deviceId: 'sg-door-01',
      door: 'unlocked',
      token: 'SECRET-DEVICE-TOKEN-123', // ⚠️ 평문 민감정보 도청 대상
      ts: '2026-08-15T00:00:00Z',
    });
    client.publish('shopguard/device/telemetry', payload);
  }, 3000);
});

client.on('message', (topic, msg) => {
  console.log(`[CMD] ${topic}: ${msg.toString()}`); // 원격 명령 수신(무인증)
});
