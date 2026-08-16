# 정보보안개론 실습 (ShopGuard)

대학생 대상 **정보보안개론** 13주차 실습 과정. 가상 쇼핑몰 **ShopGuard**를 학기 전체의
소재로 삼아 자산 식별 → 하드닝 → 공격/방어 → 탐지 → 대응 → 관리까지 한 흐름으로 다룬다.
서사는 이어지지만 **각 주차는 독립적으로 실행 가능**하다.

- **대상**: 전공 고학년 (JS/Python·CLI 능숙)
- **환경**: 개인 노트북 + VirtualBox/Docker
- **운영**: 매주 *수업 중 랩(50~90분)* + *주간 과제(2~3h)*

## 저장소 구조

| 폴더 | 대상 | 내용 |
|---|---|---|
| [`labs/`](labs/) | 학생·조교 | 주차별 과제 명세서(13개) + 실습 개요 |
| [`starter/`](starter/) | 학생 배포 | 주차별 스타터 코드·이미지·데이터 |
| [`solutions/`](solutions/) | **조교 전용** | 모범답안 코드 + 분석 주차 정답지 |
| [`grading/`](grading/) | **조교 전용** | 자동 채점 스크립트 + 루브릭 |
| [`PRD.md`](PRD.md) | 기획 | 최초 실습 아이디어 초안 |

> ⚠️ **학생에게는 `labs/`와 `starter/`만 배포한다.** `solutions/`·`grading/`는 답안·채점기이므로 제외.

## 13주차 개요

각 주차 명세서는 공통 7섹션(학습목표·준비물·수업중 랩·주간과제·제출물·루브릭·흔한오류/확장)으로 구성된다.

| 주차 | 주제 | 명세서 | 핵심 스타터 | 자동채점 |
|---|---|---|---|---|
| 1 | 정보보안의 세계 | [01](labs/01-정보보안의-세계.md) | `shopguard-assets.csv` | — |
| 2 | 시스템보안 | [02](labs/02-시스템보안.md) | `shopguard-web.Dockerfile` | — |
| 3 | 네트워크보안 | [03](labs/03-네트워크보안.md) | `shopguard-net/` | — |
| 4 | 웹보안 | [04](labs/04-웹보안.md) | `shopguard-app/` | ✅ `grade-week04` |
| 5 | 코드보안 | [05](labs/05-코드보안.md) | `shopguard-app/utils.js` | ✅ `grade-week05` |
| 6 | 악성코드 | [06](labs/06-악성코드.md) | `sample-hashes.json` | ✅ `grade-week06` |
| 7 | 암호의 이해 | [07](labs/07-암호의-이해.md) | `crypto/`, `shopguard-app/` | ✅ `grade-week07` |
| 8 | 전자상거래보안 | [08](labs/08-전자상거래보안.md) | `shopguard-app/` | ✅ `grade-week08` |
| 9 | 보안시스템 | [09](labs/09-보안시스템.md) | `suricata/` | 반자동(룰) |
| 10 | IoT·AI보안 | [10](labs/10-IoT보안과-AI보안.md) | `iot/`, `ai/classifier.py` | — |
| 11 | 침해대응·포렌식 | [11](labs/11-침해대응과-디지털포렌식.md) | `incident/` | 정답지 |
| 12 | 사회공학 | [12](labs/12-사회공학.md) | `phishing/` | 정답지 |
| 13 | 보안관리 | [13](labs/13-보안관리.md) | `risk-matrix-template.csv` | 정답지 |

전체 흐름·주차 간 자산 재사용은 [`labs/00-실습-개요.md`](labs/00-실습-개요.md) 참고.

## 관통 시나리오와 자산 재사용

```
1주 자산식별 → 2주 하드닝 → 3주 트래픽 캡처(pcap) ─┐
4주 웹취약점 → 5주 코드보안 → 6주 악성코드 → 7주 암호 │(재사용)
8주 결제/HTTPS ──────────────────▶ 9주 IDS(3주 pcap 재생)
        │(결제 로그)                                 │
        └────────────▶ 11주 포렌식 ◀────────────────┘
10주 IoT·AI → 12주 사회공학 → 13주 위험평가·정책(전체 종합)
```

| 생성 | 산출물 | 재사용 |
|---|---|---|
| 3주 | 로그인 pcap | 9주 IDS 탐지 |
| 8주 | 결제 로그 | 11주 포렌식 |
| 4·5·8주 | 취약점 목록 | 13주 위험평가 |

## 빠른 시작

### 학생

```bash
# 공용 앱(4·5·7·8주차)
cd starter/shopguard-app && npm install && npm run seed && npm start

# 나머지 주차는 각 labs/NN-*.md 의 "수업 중 랩" Step 을 따라간다
```

전체 스타터 목록: [`starter/README.md`](starter/README.md)

### 조교 (채점)

```bash
# 1) 제출물 파일 점검
grading/check-files.sh /path/to/제출루트

# 2) 코드 주차 자동 채점
cd /path/to/학생/shopguard-app && npm install
grading/run-all.sh /path/to/학생/shopguard-app

# 3) 분석 주차는 solutions/answer-keys/ + grading/rubric.md 로 수동 채점
```

채점 상세: [`grading/README.md`](grading/README.md) · 배점표: [`grading/rubric.md`](grading/rubric.md)

## ⚠️ 윤리·법적 고지

- 모든 공격 실습은 **본인이 통제하는 격리 환경(로컬 VM/컨테이너)**에서만 수행한다.
- 타인의 시스템·계정·네트워크 대상 행위는 **정보통신망법 위반**이다.
- 6주 악성코드는 **네트워크 차단 VM**에서만, 12주 교육용 피싱은 **제작만·발송 금지**.
- `starter/`의 `shopguard-web.Dockerfile`·`shopguard-app/`·`iot/`·`phishing/` 등은
  **의도적으로 취약**하다. 학습용으로만 쓰고 공개 배포하지 않는다.

## 요구 도구

Node.js 20 LTS · Docker · Git · VS Code · VirtualBox(3·9주) · Wireshark(3주) ·
Python 3.11+torch(10주) · mkcert(8주) · nmap/mosquitto-clients
