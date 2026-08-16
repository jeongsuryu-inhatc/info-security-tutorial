# 10주차 실습 — IoT보안과 AI보안

## 1. 학습 목표

- IoT 기기의 대표 취약점(기본 계정, 미인증 프로토콜)을 에뮬레이터로 점검할 수 있다.
- AI 모델의 **적대적 예제(adversarial example)** 개념을 이해하고 오분류를 유도할 수 있다.
- 두 신흥 영역의 방어 기법과 그 한계를 비교 설명할 수 있다.

## 2. 사전 준비물

- Docker (`starter/iot/docker-compose.yml`: Mosquitto MQTT 브로커 + 취약 기기 시뮬레이터)
- 도구: `mosquitto_sub`/`mosquitto_pub`, `nmap`
- AI 파트: Python 3.11 + `torch`/`torchvision` **또는** 브라우저 노트북(Colab) 대안 제공
- 스타터 자산: `starter/ai/classifier.py` (사전학습 이미지 분류 모델 + 샘플 이미지)
- 선행 지식: 기본 네트워크, Python 기본

## 3. 수업 중 랩 (80분)

> 스타터: `starter/iot/` (MQTT 브로커+기기), `starter/ai/classifier.py` (FGSM)

**Step 0.** 프로젝트 루트에서 제출 폴더를 만든다.
```bash
cd /path/to/workISTutorial
mkdir -p week10
```

### Lab 10-A. IoT 취약점 점검 (40분)

> `mosquitto_sub`/`mosquitto_pub` 은 **브로커 컨테이너(sg-mqtt) 안에 이미 들어있다.**
> 호스트에 클라이언트를 설치할 필요 없이 `docker exec sg-mqtt ...` 로 실행한다.

**Step 1.** 취약 IoT 스택을 백그라운드로 띄우고, 기기(device)가 연결될 때까지 기다린다.
```bash
docker compose -f starter/iot/docker-compose.yml up -d
# device 컨테이너가 mqtt 모듈 설치 후 연결되기까지 20~30초 걸린다
sleep 25
docker logs sg-iot-device        # "device connected (anonymous broker)" 확인
```

**Step 2.** 열린 포트를 확인한다(MQTT 1883 노출).
```bash
nmap -sV -p 1883 localhost        # nmap 이 없으면: nc -vz localhost 1883
```

**Step 3.** **인증 없이** 모든 토픽을 구독해 도청한다(5초간).
```bash
docker exec sg-mqtt timeout 5 mosquitto_sub -h localhost -p 1883 -t '#' -v
# 기대: shopguard/device/telemetry {... "token":"SECRET-DEVICE-TOKEN-123" ...}
#       → 평문 민감정보(디바이스 토큰)가 그대로 도청된다.
```

**Step 4.** 공격자가 **명령 토픽에 임의 발행**이 가능한지 확인한다.
```bash
docker exec sg-mqtt mosquitto_pub -h localhost -p 1883 -t 'shopguard/device/cmd' -m '{"cmd":"unlock"}'
docker logs sg-iot-device | grep '\[CMD\]'
# 기대: [CMD] shopguard/device/cmd: {"cmd":"unlock"}  → 무인증 원격 제어 성공
```

**Step 5.** 완화: 인증을 설정한 뒤 재기동해 Step 3 도청이 실패함을 확인한다.
```bash
# 1) 비밀번호 파일 생성 (사용자 iotuser / 비번 S3cure!)
docker exec sg-mqtt mosquitto_passwd -c -b /mosquitto/config/passwd iotuser 'S3cure!'
# 2) mosquitto.conf 를 인증 모드로 교체
cat > starter/iot/mosquitto.conf <<'EOF'
listener 1883
allow_anonymous false
password_file /mosquitto/config/passwd
EOF
# 3) 브로커 재기동
docker compose -f starter/iot/docker-compose.yml restart broker
sleep 3
# 4) 익명 도청 시도 → 인증 실패로 거부되어야 정상
docker exec sg-mqtt timeout 5 mosquitto_sub -h localhost -p 1883 -t '#' -v          # 거부됨
# 5) 인증 시에만 성공
docker exec sg-mqtt timeout 5 mosquitto_sub -h localhost -p 1883 -u iotuser -P 'S3cure!' -t '#' -v
```
> 실습 후: `docker compose -f starter/iot/docker-compose.yml down` 으로 정리하고,
> `starter/iot/mosquitto.conf` 를 원래(`allow_anonymous true`)로 되돌린다.

### Lab 10-B. 적대적 예제 (40분)

**Step 6.** 파이썬 환경과 샘플 이미지를 준비하고 정상 분류한다.
```bash
cd starter/ai
pip install torch torchvision pillow
bash get-samples.sh                              # samples/ 에 panda.jpg, cat.jpg, coffee.jpg 다운로드
python classifier.py samples/panda.jpg           # [원본] giant panda (99%) 등
```
> 오프라인이면 `get-samples.sh` 대신 ImageNet 으로 분류되는 사진을 직접 `samples/` 에 넣는다.
> torch 설치가 부담되면 Colab 에서 `classifier.py` 내용을 셀에 붙여 실행해도 된다.

**Step 7.** FGSM으로 노이즈를 더해 오분류를 유도한다. epsilon을 키우며 임계값을 찾는다.
```bash
python classifier.py samples/panda.jpg --eps 0.01
python classifier.py samples/panda.jpg --eps 0.03
python classifier.py samples/panda.jpg --eps 0.05   # "오분류 발생!" 나오는 지점 기록
```

**랩 제출물**: Step 3 MQTT 도청 캡처 + Step 7 원본/적대적 분류 결과 비교(오분류 임계 epsilon).

## 4. 주간 과제 (2.5시간)

### 과제 1. IoT 하드닝 리포트
- IoT 시뮬레이터에서 발견한 취약점(기본계정·평문 프로토콜·미인증 토픽)을 목록화하고,
  각각의 완화책을 적용해 Before/After를 기록한다.

### 과제 2. 적대적 공격 & 방어
`classifier.py`(FGSM 포함)를 확장한 `week10/adversarial.py` 를 사용한다(전체 코드는 해당 파일 참고).
여러 이미지에 epsilon 을 스윕하며 오분류율을 측정하고, 방어(입력 전처리) 전후를 비교해 그래프로 남긴다.

**Step 2-1. 코드 배치 & 샘플 준비.**
```bash
cp week10/adversarial.py starter/ai/adversarial.py   # torch·samples 가 있는 곳에서 실행
cd starter/ai
pip install torch torchvision pillow matplotlib
bash get-samples.sh                                  # samples/ 에 이미지 3장(없으면 직접 준비)
```

**Step 2-2. epsilon 스윕 + 방어 비교를 실행한다.**
```bash
# 기본: 가우시안 블러 방어. --defense jpeg 로 JPEG 재압축 방어도 비교 가능.
python adversarial.py --images samples --out ../../week10 --defense blur
```
기대 출력(예):
```
이미지 3장, epsilon 스윕: [0.0, 0.01, 0.02, 0.03, 0.05, 0.08, 0.1]
  eps=0.0    공격 오분류율=   0%   방어 후=   0%
  eps=0.03   공격 오분류율=  67%   방어 후=  33%
  eps=0.1    공격 오분류율= 100%   방어 후=  67%
그래프 저장: ../../week10/eps-misclass.png
```
- 산출물 `week10/eps-misclass.png` (epsilon–오분류율, 공격 vs 방어) 를 보고서에 넣는다.
- 분석 포인트: 방어(전처리)는 **낮은 epsilon 에서 효과적**이지만 epsilon 이 커지면 방어도 뚫린다 —
  전처리 방어의 근본적 한계와, adversarial training 같은 대안을 논한다.

> 위 수치는 예시다. 실제 값은 이미지·모델에 따라 달라지니 자신의 실행 결과를 기록한다.

## 5. 제출물

| 파일 | 내용 |
|---|---|
| `week10/iot-report.md` | IoT 취약점·완화 Before/After |
| `week10/adversarial.py` | FGSM 공격/방어 코드 |
| `week10/eps-misclass.png` | epsilon–오분류율 그래프(공격 vs 방어) |
| `week10/report.md` | 그래프 해석 + 방어 한계 분석 |

## 6. 채점 루브릭 (100점)

| 항목 | 배점 |
|---|---|
| IoT 취약점 점검·완화 | 35 |
| FGSM 오분류 유도 성공 | 30 |
| 방어 기법 적용·비교 | 20 |
| 보고서·그래프 품질 | 15 |

## 7. 흔한 오류 / 확장 과제

**흔한 오류**
- epsilon을 과도하게 키워 육안으로도 깨진 이미지 → 적대적 예제의 핵심은 **사람 눈엔 정상**임을 놓침.
- 정규화(normalization) 범위를 무시해 노이즈 스케일이 잘못됨.

**확장 과제 (심화)**
- 타깃 공격(원하는 특정 클래스로 오분류)을 구현한다.
- IoT 펌웨어 이미지에서 `binwalk`로 하드코딩된 자격증명을 추출하는 과정을 시연한다.
