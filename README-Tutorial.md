## ##########################
## 02 - 시스템보안 
## ##########################

jeongsuryu@MacBook-Pro workISTutorial % docker build -t shopguard-web -f starter/shopguard-web.Dockerfile .

[+] Building 62.0s (10/10) FINISHED                                                                                                                                                                                                      docker:desktop-linux
 => [internal] load build definition from shopguard-web.Dockerfile                                                                                                                                                                                       0.1s
 => => transferring dockerfile: 2.66kB                                                                                                                                                                                                                   0.0s
 => [internal] load metadata for docker.io/library/ubuntu:22.04                                                                                                                                                                                          2.6s
 => [internal] load .dockerignore                                                                                                                                                                                                                        0.0s
 => => transferring context: 2B                                                                                                                                                                                                                          0.0s
 => [1/6] FROM docker.io/library/ubuntu:22.04@sha256:3b06811b2afd352be909dd088a004166d665dc76d38b13eada33522a9d915c6f                                                                                                                                    2.2s
 => => resolve docker.io/library/ubuntu:22.04@sha256:3b06811b2afd352be909dd088a004166d665dc76d38b13eada33522a9d915c6f                                                                                                                                    0.0s
 => => sha256:39a945af8df2ad9343f141c82355d3f2c4b576d432eda34c460d630607462b60 29.74MB / 29.74MB                                                                                                                                                         1.1s
 => => extracting sha256:39a945af8df2ad9343f141c82355d3f2c4b576d432eda34c460d630607462b60                                                                                                                                                                1.0s
 => [2/6] RUN apt-get update && apt-get install -y --no-install-recommends       openssh-server       vsftpd       inetutils-telnetd openbsd-inetd       sudo curl nano vim       net-tools iproute2 procps sysvinit-utils       ufw fail2ban unattend  43.7s
 => [3/6] RUN mkdir -p /var/run/sshd  && sed -i 's/#\?PermitRootLogin.*/PermitRootLogin yes/'          /etc/ssh/sshd_config  && sed -i 's/#\?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config  && echo 'root:root123' | chpas  0.3s
 => [4/6] RUN useradd -m -s /bin/bash appuser  && echo 'appuser:1234' | chpasswd  && echo 'appuser ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/99-appuser  && chmod 0440 /etc/sudoers.d/99-appuser                                                          0.3s
 => [5/6] RUN mkdir -p /var/www/shopguard  && printf 'DB_USER=admin\nDB_PASS=root123\n' > /var/www/shopguard/config.env  && chmod 0777 /var/www/shopguard  && chmod 0666 /var/www/shopguard/config.env                                                   0.2s
 => [6/6] RUN printf '%s\n'   "const http = require('http');"   "http.createServer((req, res) => {"   "  res.end('ShopGuard OK - running as ' + require('os').userInfo().username);"   "}).listen(3000, () => console.log('ShopGuard web on :3000'));"   0.2s
 => exporting to image                                                                                                                                                                                                                                  12.2s
 => => exporting layers                                                                                                                                                                                                                                  9.5s
 => => exporting manifest sha256:1edea451e1f8d96871556a3275b1294cbfc77665f90bb4ebd1ad19ce3b8c0663                                                                                                                                                        0.0s
 => => exporting config sha256:6b3ed317e79303f9b2c6f1bcbcaf64a36b367a7cca69b8a2f3260360589c5c96                                                                                                                                                          0.0s
 => => exporting attestation manifest sha256:45878f836a0575f127a90fed1e1c57315bb667100ac372aecdf54b343f423860                                                                                                                                            0.0s
 => => exporting manifest list sha256:6ff92a8141198b06992a4b2e7210d025d26d30635001d5752cf0ad202e649c7e                                                                                                                                                   0.0s
 => => naming to docker.io/library/shopguard-web:latest                                                                                                                                                                                                  0.0s
 => => unpacking to docker.io/library/shopguard-web:latest                                                                                                                                                                                               2.6s
jeongsuryu@MacBook-Pro workISTutorial %


jeongsuryu@MacBook-Pro workISTutorial % docker images
                                                                                                                                                                                                                                         i Info →   U  In Use
IMAGE                                                   ID             DISK USAGE   CONTENT SIZE   EXTRA
infra-app:latest                                        0d280fa14385        298MB         68.6MB
mysql:8.4                                               b3b90af2a655       1.12GB          255MB
nginx-lab-app:latest                                    2ee6aa808c96        298MB         68.4MB
nginx:1.27-alpine                                       65645c7bb6a0       74.5MB         21.9MB
postgres:15-alpine                                      3d0f7584ed7d        417MB          116MB
public.ecr.aws/supabase/edge-runtime:v1.74.2            a82676277615       1.12GB          391MB    U
public.ecr.aws/supabase/gotrue:v2.193.0                 ac6d4b1e961a       90.3MB         28.6MB
public.ecr.aws/supabase/gotrue:v2.194.0                 2b352c02adf1       90.9MB         28.8MB    U
public.ecr.aws/supabase/kong:2.8.1                      1b53405d8680        203MB         49.3MB    U
public.ecr.aws/supabase/logflare:1.47.1                 72b19f0256c7        923MB          276MB    U
public.ecr.aws/supabase/mailpit:v1.30.2                 37a38e48e933       49.7MB           14MB    U
public.ecr.aws/supabase/pg_prove:3.36                   eda7c5e68719       75.4MB         17.5MB
public.ecr.aws/supabase/postgres-meta:v0.96.6           a84cc713585e        504MB         99.2MB    U
public.ecr.aws/supabase/postgres:15.8.1.085             af083ef64d04          3GB          681MB
public.ecr.aws/supabase/postgres:17.6.1.147             ac581882596e        1.7GB          370MB    U
public.ecr.aws/supabase/postgrest:v14.15                2f8e7b656f09         28MB         6.37MB
public.ecr.aws/supabase/postgrest:v14.5                 b574528fe109       27.3MB         6.29MB    U
public.ecr.aws/supabase/realtime:v2.113.4               d6a91caf3bd5        529MB          123MB    U
public.ecr.aws/supabase/storage-api:v1.66.4             ead6d49b9873       1.39GB          243MB
public.ecr.aws/supabase/storage-api:v1.67.26            0495ed361b04       1.38GB          243MB    U
public.ecr.aws/supabase/studio:2026.07.13-sha-b5ada96   6eb53ad42024       1.64GB          325MB    U
public.ecr.aws/supabase/vector:0.53.0-alpine            ca92d617e905        209MB         56.6MB    U
shopguard-web:latest                                    6ff92a814119        443MB          107MB


jeongsuryu@MacBook-Pro workISTutorial % docker ps -a
CONTAINER ID   IMAGE                                                   COMMAND                    CREATED          STATUS                      PORTS     NAMES
c2d5710afda3   shopguard-web:latest                                    "/bin/bash"                20 seconds ago   Exited (0) 19 seconds ago             adoring_hofstadter
ba908b38a0f7   public.ecr.aws/supabase/studio:2026.07.13-sha-b5ada96   "docker-entrypoint.s…"    10 days ago      Exited (143) 2 days ago               supabase_studio_senior-game-land
324d6e562361   public.ecr.aws/supabase/postgres-meta:v0.96.6           "docker-entrypoint.s…"    10 days ago      Exited (137) 2 days ago               supabase_pg_meta_senior-game-land



jeongsuryu@MacBook-Pro workISTutorial % docker run -it --name sg-web shopguard-web
root@b60f1742fff5:/# service ssh start
 * Starting OpenBSD Secure Shell server sshd                                                                                            [ OK ]
root@b60f1742fff5:/# service vsftpd start
 * Starting FTP server vsftpd                                                                                                           [ OK ]
root@b60f1742fff5:/# service openbsd-inetd start
 * Not starting internet superserver: no services enabled


root@b60f1742fff5:/# service --status-all
 [ - ]  fail2ban
 [ ? ]  hwclock.sh
 [ + ]  inetutils-syslogd
 [ - ]  openbsd-inetd
 [ - ]  procps
 [ + ]  ssh
 [ - ]  ufw
 [ - ]  unattended-upgrades
 [ + ]  vsftpd
root@b60f1742fff5:/# ss -tlnp
State        Recv-Q        Send-Q               Local Address:Port               Peer Address:Port       Process
LISTEN       0             128                        0.0.0.0:22                      0.0.0.0:*           users:(("sshd",pid=24,fd=3))
LISTEN       0             32                               *:21                            *:*           users:(("vsftpd",pid=44,fd=3))
LISTEN       0             128                           [::]:22                         [::]:*           users:(("sshd",pid=24,fd=4))
root@b60f1742fff5:/#


root@b60f1742fff5:/# lynis audit system --quick 2>&1 | tee /tmp/lynis-before.txt

[ Lynis 3.0.7 ]

################################################################################
  Lynis comes with ABSOLUTELY NO WARRANTY. This is free software, and you are
  welcome to redistribute it under the terms of the GNU General Public License.
  See the LICENSE file for details about using this software.

  2007-2021, CISOfy - https://cisofy.com/lynis/
  Enterprise support available (compliance, plugins, interface and tools)
################################################################################


[+] Initializing program
------------------------------------
  - Detecting OS...                                           [ DONE ]
  - Checking profiles...                                      [ DONE ]

  ---------------------------------------------------
  Program version:           3.0.7
  Operating system:          Linux
  Operating system name:     Ubuntu
  Operating system version:  22.04
  Kernel version:            6.12.76
  Hardware platform:         x86_64
  Hostname:                  b60f1742fff5
  ---------------------------------------------------
  Profiles:                  /etc/lynis/default.prf
  Log file:                  /var/log/lynis.log
  Report file:               /var/log/lynis-report.dat
  Report version:            1.0
  Plugin directory:          /etc/lynis/plugins
  ---------------------------------------------------
  Auditor:                   [Not Specified]
  Language:                  en
  Test category:             all
  Test group:                all
  ---------------------------------------------------
  - Program update status...                                  [ NO UPDATE ]

[+] System tools
------------------------------------
  - Scanning available tools...
  - Checking system binaries...

[+] Plugins (phase 1)
------------------------------------
 Note: plugins have more extensive tests and may take several minutes to complete

  - Plugin: debian
    [
[+] Debian Tests
------------------------------------
  - Checking for system binaries that are required by Debian Tests...
    - Checking /bin...                                        [ FOUND ]
    - Checking /sbin...                                       [ FOUND ]
    - Checking /usr/bin...                                    [ FOUND ]
    - Checking /usr/sbin...                                   [ FOUND ]
    - Checking /usr/local/bin...                              [ FOUND ]
    - Checking /usr/local/sbin...                             [ FOUND ]
  - Authentication:
    - PAM (Pluggable Authentication Modules):
      - libpam-tmpdir                                         [ Not Installed ]

...


================================================================================

  Lynis security scan details:

  Hardening index : 57 [###########         ]
  Tests performed : 240
  Plugins enabled : 1

  Components:
  - Firewall               [V]
  - Malware scanner        [X]

  Scan mode:
  Normal [V]  Forensics [ ]  Integration [ ]  Pentest [ ]

  Lynis modules:
  - Compliance status      [?]
  - Security audit         [V]
  - Vulnerability scan     [V]

  Files:
  - Test and debug information      : /var/log/lynis.log
  - Report data                     : /var/log/lynis-report.dat


root@b60f1742fff5:/# ls -al /tmp/lynis-before.txt
-rw-r--r-- 1 root root 33886 Aug 15 13:16 /tmp/lynis-before.txt
root@b60f1742fff5:/#


root@b60f1742fff5:/# ls -al /tmp/lynis-before.txt
-rw-r--r-- 1 root root 33886 Aug 15 13:16 /tmp/lynis-before.txt
root@b60f1742fff5:/#
root@b60f1742fff5:/#
root@b60f1742fff5:/# service vsftpd stop
 * Stopping FTP server vsftpd                                                                                                           [ OK ]
root@b60f1742fff5:/# service openbsd-inetd stop
 * Stopping internet superserver inetd                                                                                                  [ OK ]
root@b60f1742fff5:/#
root@b60f1742fff5:/# apt-get remove --purge -y vsftpd inetutils-telnetd openbsd-inetd telnet
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
Package 'telnet' is not installed, so not removed
The following packages were automatically installed and are no longer required:
  inetutils-syslogd libevent-2.1-7 libgdbm-compat4 libgdbm6 libperl5.34 perl perl-modules-5.34 tcpd update-inetd
Use 'apt autoremove' to remove them.
The following packages will be REMOVED:
  inetutils-telnetd* openbsd-inetd* vsftpd*
0 upgraded, 0 newly installed, 3 to remove and 2 not upgraded.
After this operation, 591 kB disk space will be freed.
(Reading database ... 11207 files and directories currently installed.)
Removing inetutils-telnetd (2:2.2-2ubuntu0.2) ...
invoke-rc.d: could not determine current runlevel
invoke-rc.d: policy-rc.d denied execution of force-reload.
Removing openbsd-inetd (0.20160825-5) ...
invoke-rc.d: could not determine current runlevel
invoke-rc.d: policy-rc.d denied execution of stop.
Removing vsftpd (3.0.5-0ubuntu1.1) ...
invoke-rc.d: could not determine current runlevel
invoke-rc.d: policy-rc.d denied execution of stop.
(Reading database ... 11138 files and directories currently installed.)
Purging configuration files for inetutils-telnetd (2:2.2-2ubuntu0.2) ...
Purging configuration files for vsftpd (3.0.5-0ubuntu1.1) ...
Purging configuration files for openbsd-inetd (0.20160825-5) ...
root@b60f1742fff5:/#


root@b60f1742fff5:/# service vsftpd stop
 * Stopping FTP server vsftpd                                                                                                           [ OK ]
root@b60f1742fff5:/# service openbsd-inetd stop
 * Stopping internet superserver inetd                                                                                                  [ OK ]
root@b60f1742fff5:/#
root@b60f1742fff5:/# apt-get remove --purge -y vsftpd inetutils-telnetd openbsd-inetd telnet
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
Package 'telnet' is not installed, so not removed
The following packages were automatically installed and are no longer required:
  inetutils-syslogd libevent-2.1-7 libgdbm-compat4 libgdbm6 libperl5.34 perl perl-modules-5.34 tcpd update-inetd
Use 'apt autoremove' to remove them.
The following packages will be REMOVED:
  inetutils-telnetd* openbsd-inetd* vsftpd*
0 upgraded, 0 newly installed, 3 to remove and 2 not upgraded.
After this operation, 591 kB disk space will be freed.
(Reading database ... 11207 files and directories currently installed.)
Removing inetutils-telnetd (2:2.2-2ubuntu0.2) ...
invoke-rc.d: could not determine current runlevel
invoke-rc.d: policy-rc.d denied execution of force-reload.
Removing openbsd-inetd (0.20160825-5) ...
invoke-rc.d: could not determine current runlevel
invoke-rc.d: policy-rc.d denied execution of stop.
Removing vsftpd (3.0.5-0ubuntu1.1) ...
invoke-rc.d: could not determine current runlevel
invoke-rc.d: policy-rc.d denied execution of stop.
(Reading database ... 11138 files and directories currently installed.)
Purging configuration files for inetutils-telnetd (2:2.2-2ubuntu0.2) ...
Purging configuration files for vsftpd (3.0.5-0ubuntu1.1) ...
Purging configuration files for openbsd-inetd (0.20160825-5) ...
root@b60f1742fff5:/#
root@b60f1742fff5:/#
root@b60f1742fff5:/# find / -xdev -type f -perm -0002 2>/dev/null
/var/www/shopguard/config.env
root@b60f1742fff5:/# find / -xdev -type d -perm -0002 2>/dev/null
/tmp
/run/lock
/var/tmp
/var/www/shopguard
root@b60f1742fff5:/# chmod 0750 /var/www/shopguard
root@b60f1742fff5:/# chmod 0640 /var/www/shopguard/config.env
root@b60f1742fff5:/# ls -l /var/www/shopguard
total 8
-rw-r----- 1 root root  30 Aug 15 13:06 config.env
-rw-r--r-- 1 root root 203 Aug 15 13:06 server.js
root@b60f1742fff5:/#
root@b60f1742fff5:/# chown -R appuser:appuser /var/www/shopguard
runuser -u appuser -- node /var/www/shopguard/server.js &
curl -s localhost:3000
[1] 26802
root@b60f1742fff5:/# ShopGuard web on :3000

root@b60f1742fff5:/# jobs
[1]+  Running                 runuser -u appuser -- node /var/www/shopguard/server.js &
root@b60f1742fff5:/#
root@b60f1742fff5:/# cat /etc/sudoers.d/99-appuser
appuser ALL=(ALL) NOPASSWD:ALL
root@b60f1742fff5:/#
root@b60f1742fff5:/# echo 'appuser ALL=(root) /usr/sbin/service *' > /etc/sudoers.d/99-appuser
root@b60f1742fff5:/# chmod 0440 /etc/sudoers.d/99-appuser
root@b60f1742fff5:/# visudo -c
/etc/sudoers: parsed OK
/etc/sudoers.d/99-appuser: parsed OK
/etc/sudoers.d/README: parsed OK
root@b60f1742fff5:/#


root@b60f1742fff5:/# sed -i 's/^PermitRootLogin.*/PermitRootLogin no/'            /etc/ssh/sshd_config
sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
grep -E 'PermitRootLogin|PasswordAuthentication' /etc/ssh/sshd_config
service ssh restart
PermitRootLogin no
PasswordAuthentication no
# PasswordAuthentication yes
# the setting of "PermitRootLogin yes
# PAM authentication, then enable this but set PasswordAuthentication yes
 * Restarting OpenBSD Secure Shell server sshd                                                                                          [ OK ]
root@b60f1742fff5:/#

root@b60f1742fff5:/# passwd -l root
passwd: password expiry information changed.
root@b60f1742fff5:/# echo 'appuser:S3cure-Pass!2026' | chpasswd


root@b60f1742fff5:/# lynis audit system --quick 2>&1 | tee /tmp/lynis-after.txt
...

root@b60f1742fff5:/# grep -i "Hardening index" /tmp/lynis-after.txt
  Hardening index : 58 [###########         ]


## ##########################
## 03 - 네트워크보안
## ##########################

jeongsuryu@MacBook-Pro workISTutorial % docker compose -f starter/shopguard-net/docker-compose.yml up

[+] up 5/5
 ✔ Image node:20-slim          Pulled                                                                                 6.3s
 ✔ Network shopguard-net_sgnet Created                                                                                0.1s
 ✔ Container sg-net-web        Created                                                                                0.2s
Attaching to sg-net-web
sg-net-web  | plaintext login server on :80


jeongsuryu@MacBook-Pro workISTutorial % docker ps
CONTAINER ID   IMAGE          COMMAND                   CREATED         STATUS         PORTS                                                                              NAMES
9ac96cb3206f   node:20-slim   "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes   0.0.0.0:2222->22/tcp, [::]:2222->22/tcp, 0.0.0.0:8080->80/tcp, [::]:8080->80/tcp   sg-net-web


jeongsuryu@MacBook-Pro workISTutorial % netstat -an | more
Active Internet connections (including servers)
Proto Recv-Q Send-Q  Local Address                                 Foreign Address                               (state)
tcp4       0      0  172.30.1.32.57845      172.217.213.94.443     ESTABLISHED
tcp6       0      0  fe80::aede:48ff:.57843 fe80::aede:48ff:.49155 ESTABLISHED
tcp46      0      0  *.8080                 *.*                    LISTEN


% ifconfig | more
lo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384
        options=1203<RXCSUM,TXCSUM,TXSTATUS,SW_TIMESTAMP>
        inet 127.0.0.1 netmask 0xff000000
        inet6 ::1 prefixlen 128
        inet6 fe80::1%lo0 prefixlen 64 scopeid 0x1
        nd6 options=201<PERFORMNUD,DAD>
en5: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 16000
        ether ac:de:48:00:11:22
        inet6 fe80::aede:48ff:fe00:1122%en5 prefixlen 64 scopeid 0x4
        nd6 options=201<PERFORMNUD,DAD>
        media: autoselect (100baseTX <full-duplex>)
        status: active
en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
        options=6460<TSO4,TSO6,CHANNEL_IO,PARTIAL_CSUM,ZEROINVERT_CSUM>
        ether 14:7d:da:4a:57:38
        inet6 fe80::1c2c:23b7:2407:907e%en0 prefixlen 64 secured scopeid 0x6
        inet 172.30.1.32 netmask 0xffffff00 broadcast 172.30.1.255
        nd6 options=201<PERFORMNUD,DAD>
        media: autoselect
        status: active


% ipconfig getifaddr en0
172.30.1.32



## ######################
## wireshark 실행 
## ######################
감시: loopback: lo0 (macOS)
filter: http.request.method == "POST"

Frame 171: Packet, 114 bytes on wire (912 bits), 114 bytes captured (912 bits) on interface lo0, id 0
HTML Form URL Encoded: application/x-www-form-urlencoded


## ######################
## nmap 실행 
## ######################
jeongsuryu@MacBook-Pro week03 % /Applications/nmap.app/Contents/MacOS/nmap -sV -p 1-10000 localhost
Starting Nmap 7.991 ( https://nmap.org ) at 2026-08-16 12:32 +0900
Warning: Hostname localhost resolves to 2 IPs. Using 127.0.0.1.
Nmap scan report for localhost (127.0.0.1)
Host is up (0.000057s latency).
Other addresses for localhost (not scanned): ::1
Not shown: 9995 closed tcp ports (conn-refused)
PORT     STATE SERVICE       VERSION
2222/tcp open  tcpwrapped
3306/tcp open  mysql         MySQL 8.3.0
5037/tcp open  unknown
8080/tcp open  http-proxy
9277/tcp open  traingpsdata?
Nmap done: 1 IP address (1 host up) scanned in 12.06 seconds


## 방화벽 정책 설정 
jeongsuryu@MacBook-Pro week03 % docker exec -it sg-net-web sh -c "apt-get update && apt-get install -y ufw"
jeongsuryu@MacBook-Pro week03 % docker exec -it sg-net-web sh -c "ufw default deny incoming && ufw allow 80/tcp && ufw --force enable"\n


jeongsuryu@MacBook-Pro week03 % /Applications/nmap.app/Contents/MacOS/nmap -sV -p 1-10000 localhost
Starting Nmap 7.991 ( https://nmap.org ) at 2026-08-16 12:38 +0900
Warning: Hostname localhost resolves to 2 IPs. Using 127.0.0.1.
Nmap scan report for localhost (127.0.0.1)
Host is up (0.000047s latency).
Other addresses for localhost (not scanned): ::1
Not shown: 9995 closed tcp ports (conn-refused)
PORT     STATE SERVICE       VERSION
2222/tcp open  tcpwrapped
3306/tcp open  mysql         MySQL 8.3.0
5037/tcp open  unknown
8080/tcp open  http-proxy
9277/tcp open  traingpsdata?
Nmap done: 1 IP address (1 host up) scanned in 11.97 seconds


## ###############################3
## docker 안에서 실행해 보자 
## ###############################3
내PC
% docker exec -it sg-net-web /bin/sh

docker root 
# apt install nmap
# nmap -sV -p 1-10000 localhost

# 방화벽 규칙-허용
ufw allow 9666/udp
# 방화벽 규칙-거부 
ufw deny 9666/tcp
# 방화벽 규칙-삭제 
ufw delete deny 9666


jeongsuryu@MacBook-Pro workISTutorial % docker compose -f starter/shopguard-net/docker-compose.yml down

[+] down 2/2
 ✔ Container sg-net-web        Removed                                                                               10.5s
 ✔ Network shopguard-net_sgnet Removed

jeongsuryu@MacBook-Pro workISTutorial % docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES



## ###############################
## 04.웹보안 
## ###############################
jeongsuryu@MacBook-Pro workISTutorial % curl -s -X POST localhost:3000/login \
  --data-urlencode "email=admin@shop.com'--" \
  --data-urlencode "password=아무거나"
{"ok":true,"user":{"id":1,"email":"admin@shop.com","role":"admin"}}%
jeongsuryu@MacBook-Pro workISTutorial %
jeongsuryu@MacBook-Pro workISTutorial % curl -s -X POST localhost:3000/login \
  --data-urlencode "email=admin@shop.com" --data-urlencode "password=wrong"
{"ok":false,"error":"인증 실패"}%
jeongsuryu@MacBook-Pro workISTutorial %


## auth.js log 추가, 로그결과  
sql>
SELECT id, email, role FROM users
               WHERE email = 'admin@shop.com'--' AND password = 'admin1234'


## Query 구문을 이렇게 하면 해결 
 const sql = `SELECT id, email, role FROM users
               WHERE password = '${password}' AND email = '${email}'`;


## ###############################
## 05.코드보안 
## ###############################

jeongsuryu@MacBook-Pro workISTutorial % docker run --rm -v "$PWD:/src" semgrep/semgrep \
  semgrep --config=auto /src/starter/shopguard-app 2>&1 | tee week05/semgrep-before.txt

┌──────────────┐
│ Scan Summary │
└──────────────┘
✅ Scan completed successfully.
 • Findings: 3 (3 blocking)
 • Rules run: 203
 • Targets scanned: 12
 • Parsed lines: ~100.0%
 • Scan skipped:
   ◦ Files matching .semgrepignore patterns: 151
 • For a detailed list of skipped files and lines, run semgrep with the --verbose flag
Ran 203 rules on 12 files: 3 findings.


ShopGuard 프로젝트의 소스 코드를 정적 분석(SAST) 했을 때 발견된 보안 취약점 경고
1.CSRF 방어 미적용
2.Path Traversal(경로 조작) 가능성
3.Command Injection(명령어 주입) 가능성

week05/README.md 참조 

jeongsuryu@MacBook-Pro shopguard-app % node --test utils-test.js
✔ readUpload: 상위경로(../) 순회 거부 (3.791648ms)
✔ readUpload: 디렉터리 구분자(/, \) 거부 (0.572649ms)
✔ readUpload: 절대경로 거부 (0.225562ms)
✔ readUpload: 비문자열/빈 값 거부 (0.589592ms)
✔ readUpload: 정상 파일명 통과 (1.569428ms)
✔ makeThumb: 세미콜론 명령 분리 거부 (0.413855ms)
✔ makeThumb: 명령 치환($(), ``) 거부 (1.379032ms)
✔ makeThumb: 파이프/리다이렉트/공백 거부 (0.210787ms)
✔ makeThumb: 정상 파일명 통과 (9.204431ms)
✔ merge: __proto__ 오염 차단(전역 미오염) (0.631771ms)
✔ merge: constructor.prototype 오염 차단 (0.213973ms)
✔ merge: 정상 병합(중첩 포함) (1.885005ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 179.067135


jeongsuryu@MacBook-Pro workISTutorial % docker run --rm -v "$PWD:/src" semgrep/semgrep \
  semgrep --config=auto /src/starter/shopguard-app 2>&1 | tee week05/semgrep-after.txt
┌──────────────┐
│ Scan Summary │
└──────────────┘
✅ Scan completed successfully.
 • Findings: 5 (5 blocking)
 • Rules run: 203
 • Targets scanned: 16
 • Parsed lines: ~100.0%
 • Scan skipped:
   ◦ Files matching .semgrepignore patterns: 156
 • For a detailed list of skipped files and lines, run semgrep with the --verbose flag
Ran 203 rules on 16 files: 5 findings.



## ###############################
## 06.악성코드 
## ###############################

jeongsuryu@MacBook-Pro workISTutorial % docker exec -it malware-lab-lab-run-64cad1ed907b sh
$ ls
rules.json  scanner.js
$ ls -al
total 16
drwxr-xr-x 4 analyst analyst  128 Aug 16 13:12 .
drwxr-xr-x 1 root    root    4096 Aug 16 13:13 ..
-rw-r--r-- 1 analyst analyst 1113 Aug 16 13:11 rules.json
-rw-r--r-- 1 analyst analyst 4716 Aug 16 13:12 scanner.js
$
$ printf '%s' 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > test-folder/eicar.com
sh: 5: cannot create test-folder/eicar.com: Directory nonexistent
$ mkdir test-folder
$ printf '%s' 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > test-folder/eicar.com
$ ls -al test-folder
total 4
drwxr-xr-x 3 analyst analyst  96 Aug 16 13:17 .
drwxr-xr-x 5 analyst analyst 160 Aug 16 13:17 ..
-rw-r--r-- 1 analyst analyst  68 Aug 16 13:17 eicar.com
$ file test-folder/eicar.com
test-folder/eicar.com: EICAR virus test files
$ sha256sum test-folder/eicar.com
275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f  test-folder/eicar.com
$ node scanner.js ./test-folder

스캔 대상: ./test-folder  (파일 1개, 탐지 1건)

[HIGH] test-folder/eicar.com  (hash:EICAR-Test-File) — sha256=275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f

JSON 리포트: scan-report.json
$


## 설명
. 왜 파일의 Hash를 사용하는가?

파일 자체를 비교하는 대신 파일의 지문(fingerprint)을 비교할 수 있습니다.

예를 들어:

파일 A
   ↓
SHA-256
   ↓
275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f

악성코드 데이터베이스에 다음과 같은 정보가 있다고 가정합니다.

275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f
→ EICAR-Test-File
→ HIGH

그러면 스캐너는 파일의 내용을 직접 분석하지 않고도:

파일
 ↓
SHA-256 계산
 ↓
해시 DB 조회
 ↓
일치
 ↓
악성/테스트 파일 탐지

할 수 있습니다.

이것을 Hash-based Detection이라고 볼 수 있습니다.


## docker 로 실행 
jeongsuryu@MacBook-Pro workISTutorial % docker compose -f starter/malware-lab/docker-compose.yml run --rm lab \
  node scanner.js ./test-folder
Container malware-lab-lab-run-0f83980cdf98 Creating
Container malware-lab-lab-run-0f83980cdf98 Created

스캔 대상: ./test-folder  (파일 1개, 탐지 1건)

[HIGH] test-folder/eicar.com  (hash:EICAR-Test-File) — sha256=275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f

JSON 리포트: scan-report.json


## ###############################
## docker command 
## ###############################

현재 실행중인 컨테이너 확인
$ docker ps
 
컨테이너 중지
$ docker stop 컨테이너_id
 
정지된 컨테이너 확인
$ docker ps -a

컨테이너 삭제
$ docker rm 컨테이너_id

복수 컨테이너 삭제
$ docker rm 컨테이너_id, 컨테이너_id
 
현재 이미지 확인
$ docker images
 
이미지 삭제
$ docker rmi 이미지_id
 
이미지 복수 삭제
$ docker rmi 이미지_id 이미지_id 이미지_id
 
모든 컨테이너 중지 및 삭제
$ docker stop $(docker ps -aq)
$ docker rm $(docker ps -aq)
 
모든 이미지 중지 및 삭제
$ docker rmi $(docker images -q)

