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

## 윈도우에 Docker Desktop 으로 테스트 환경 설정하기  
# 윈도우용 docker desktop 설치 

# Windows PowerShell 
  git clone https://github.com/jeongsuryu-inhatc/info-security-tutorial.git 
  cd /projects/info-security-tutorial
  docker run -it --name security-dev -v /var/run/docker.sock:/var/run/docker.sock -v "$(pwd):/projects/info-security-tutorial" ubuntu:22.04 bash


sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io


# sudo systemctl status docker
# sudo docker run hello-world


# 컨테이너 내부에서 
  cd /projects/info-security-tutorial
  docker build   -t shopguard-web   -f starter/shopguard-web.Dockerfile   .


docker run   → 새로운 컨테이너 생성 + 실행
docker start → 기존 컨테이너 다시 실행
docker exec  → 실행 중인 컨테이너에서 명령 실행

# 재접속시 명령어 
  docker start -ai security-dev


--- 

# Dockerfile
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        vim \
        nano \
        git \
        curl \
        wget \
        net-tools \
        iproute2 \
        iputils-ping \
        procps \
        tree \
        unzip \
        zip \
        ca-certificates \
        gnupg \
        lsb-release \
        openssh-client \
        build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /projects

CMD ["/bin/bash"]

# 이미지 Build - Dockerfile이 있는 현재 디렉터리에서:

docker build -t ubuntu-dev:24.04 

# 확인 
docker images

# 현재 폴더를 /projects로 마운트하여 실행
cd C:\projects\info-security-tutorial
docker run -it   --name ubuntu-dev   -v "$(pwd):/projects" ubuntu-dev:22.04

## 컨테이너에 들어가면 Dockerfile의 WORKDIR 때문에 바로:
root@xxxx:/projects#
pwd
ls -al

## 결과 
/projects

Dockerfile
starter/
src/
README.md
...


## 종료 
docker ps -a

## 중요하게, 다시 사용할 때는 docker run을 하지 않습니다.
    docker start -ai ubuntu-dev
  또는 
    docker start ubuntu-dev
    docker exec -it ubuntu-dev bash



# 8. Docker CLI까지 컨테이너에서 사용하려면

앞서 발생했던:

failed to connect to the docker API at
unix:///var/run/docker.sock

문제까지 해결하려면 Docker Desktop의 socket도 연결해야 합니다.

Linux/WSL 환경에서는 예를 들어:

docker run -it \
  --name ubuntu-dev \
  -v "$(pwd):/projects" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ubuntu-dev:24.04

단, 이미지 내부에 Docker CLI도 있어야 합니다.

Dockerfile에 Docker CLI 설치까지 포함시키려면 Ubuntu 패키지 기준으로 다음을 추가할 수 있습니다.

RUN apt-get update && \
    apt-get install -y docker.io && \
    rm -rf /var/lib/apt/lists/*

그러면 구조가:

Docker Desktop
      │
      │ Docker Engine
      │
      ├──── /var/run/docker.sock
      │              ↑
      │              │
      │        ubuntu-dev Container
      │        ├── Docker CLI
      │        ├── git
      │        ├── vim
      │        ├── curl
      │        └── /projects
      │              ↑
      │              │ Bind Mount
      │              │
      └──── Host 프로젝트 폴더

가 됩니다.

다만 docker.sock을 컨테이너에 노출하면 그 컨테이너는 사실상 호스트 Docker daemon에 매우 강한 권한을 갖게 됩니다. 
신뢰할 수 있는 로컬 개발/교육 컨테이너에서만 사용하는 것이 좋습니다.

  
