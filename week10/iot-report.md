# week10 — IoT 하드닝 리포트

> 대상: `starter/iot/` (Mosquitto MQTT 브로커 + 취약 기기 시뮬레이터 `sensor.js`)
> 방법: 취약점 재현(Docker) → 완화 적용 → 재현 실패 확인(Before/After)

## 1. 발견한 취약점

| # | 취약점 | 위치/근거 | 위험 |
|---|---|---|---|
| V1 | 익명(무인증) 접속 허용 | `mosquitto.conf: allow_anonymous true` | 누구나 도청·발행 가능 |
| V2 | 민감정보 평문 전송 | `sensor.js` telemetry 에 `token=SECRET-DEVICE-TOKEN-123` | 디바이스 토큰 도청 |
| V3 | 명령 토픽 무인증 발행 | `shopguard/device/cmd` 구독·발행에 인증 없음 | 원격 무단 제어(unlock) |
| V4 | 기본 계정 사용 | `sensor.js: username:'admin', password:'admin'` | 자격증명 추측 용이 |

## 2. Before — 취약점 재현 (실측)

```bash
docker compose -f starter/iot/docker-compose.yml up -d && sleep 25
```

**V1+V2 도청** — 인증 없이 전 토픽 구독:
```bash
docker exec sg-mqtt timeout 5 mosquitto_sub -h localhost -p 1883 -t '#' -v
```
```
shopguard/device/telemetry {"deviceId":"sg-door-01","door":"unlocked","token":"SECRET-DEVICE-TOKEN-123","ts":"..."}
```
→ 평문 디바이스 토큰이 그대로 노출됨.

**V3 무인증 원격 제어** — 명령 토픽에 임의 발행:
```bash
docker exec sg-mqtt mosquitto_pub -h localhost -p 1883 -t 'shopguard/device/cmd' -m '{"cmd":"unlock"}'
docker logs sg-iot-device | grep '\[CMD\]'
```
```
[CMD] shopguard/device/cmd: {"cmd":"unlock"}
```
→ 인증 없이 기기가 `unlock` 명령을 수신·처리.

## 3. 완화 조치

| 취약점 | 완화책 |
|---|---|
| V1 | `allow_anonymous false` + `password_file` 로 인증 강제 |
| V2 | 민감정보(토큰)를 페이로드에서 제거하거나 TLS(mqtts, 8883) 로 전송 암호화 |
| V3 | 명령 토픽에 ACL 적용 — 인증된 특정 클라이언트만 발행 허용 |
| V4 | 기본 계정 제거, 기기별 고유 자격증명(또는 클라이언트 인증서) 발급 |

## 4. After — 완화 적용 후 재현 실패 (실측)

```bash
docker exec sg-mqtt mosquitto_passwd -c -b /mosquitto/config/passwd iotuser 'S3cure!'
cat > starter/iot/mosquitto.conf <<'EOF'
listener 1883
allow_anonymous false
password_file /mosquitto/config/passwd
EOF
docker compose -f starter/iot/docker-compose.yml restart broker && sleep 3
```
- 익명 구독 시도 → **인증 실패로 거부**(도청 불가)
- 인증(`-u iotuser -P 'S3cure!'`) 시에만 구독 성공

## 5. 결론

MQTT 는 기본적으로 인증·암호화가 없어, 설정을 명시하지 않으면 **도청·무단 제어에 그대로 노출**된다.
최소 조치는 (1) 익명 접속 차단 + 자격증명, (2) TLS 전송 암호화, (3) 토픽 ACL 이며,
민감정보는 애초에 평문 페이로드에 담지 않는 것이 원칙이다.
