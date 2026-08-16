# starter/shopguard-web.Dockerfile
# ---------------------------------------------------------------------------
# 2주차 시스템보안 실습용 "의도적으로 취약한" ShopGuard 웹서버 이미지.
# 학습 목적으로 일부러 느슨하게 설정되어 있다. 절대 실제 환경에 배포하지 말 것.
#
# 빌드:  docker build -t shopguard-web -f starter/shopguard-web.Dockerfile .
# 실행:  docker run -it --name sg-web shopguard-web
# ---------------------------------------------------------------------------
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# --- 공격 표면을 넓히기 위해 불필요/취약 서비스를 잔뜩 설치 -------------------
#     (하드닝 실습에서 학생이 제거·비활성화할 대상들)
RUN apt-get update && apt-get install -y --no-install-recommends \
      openssh-server \
      vsftpd \
      inetutils-telnetd openbsd-inetd \
      sudo curl nano vim \
      net-tools iproute2 procps sysvinit-utils \
      ufw fail2ban unattended-upgrades \
      lynis \
      nodejs \
 && rm -rf /var/lib/apt/lists/*

# --- 취약점 1: SSH가 root 원격 로그인과 비밀번호 인증을 허용 ------------------
RUN mkdir -p /var/run/sshd \
 && sed -i 's/#\?PermitRootLogin.*/PermitRootLogin yes/'          /etc/ssh/sshd_config \
 && sed -i 's/#\?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config \
 && echo 'root:root123' | chpasswd

# --- 취약점 2: 약한 비밀번호를 가진 앱 계정 + 무제한 sudo(NOPASSWD:ALL) -------
RUN useradd -m -s /bin/bash appuser \
 && echo 'appuser:1234' | chpasswd \
 && echo 'appuser ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/99-appuser \
 && chmod 0440 /etc/sudoers.d/99-appuser

# --- 취약점 3: world-writable 디렉터리/파일 + 민감정보 평문 저장 -------------
RUN mkdir -p /var/www/shopguard \
 && printf 'DB_USER=admin\nDB_PASS=root123\n' > /var/www/shopguard/config.env \
 && chmod 0777 /var/www/shopguard \
 && chmod 0666 /var/www/shopguard/config.env

# --- 취약점 4: 웹앱을 root로 실행하도록 배치 (하드닝 시 appuser로 이전) -------
RUN printf '%s\n' \
  "const http = require('http');" \
  "http.createServer((req, res) => {" \
  "  res.end('ShopGuard OK - running as ' + require('os').userInfo().username);" \
  "}).listen(3000, () => console.log('ShopGuard web on :3000'));" \
  > /var/www/shopguard/server.js

# telnet(23), ftp(21), ssh(22), web(3000) 포트를 노출
EXPOSE 21 22 23 3000

# 실습을 위해 대화형 셸로 진입한다. 서비스는 학생이 단계별로 직접 기동한다.
CMD ["/bin/bash"]
