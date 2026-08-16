[ Lynis 3.1.7 ]

################################################################################
  Lynis comes with ABSOLUTELY NO WARRANTY. This is free software, and you are
  welcome to redistribute it under the terms of the GNU General Public License.
  See the LICENSE file for details about using this software.

  2007-2025, CISOfy - https://cisofy.com/lynis/
  Enterprise support available (compliance, plugins, interface and tools)
################################################################################


[+] Initializing program
------------------------------------
  - Detecting OS...                                           [ DONE ]
  - Checking profiles...                                      [ DONE ]
  - Detecting language and localization                       [ ko ]

  ---------------------------------------------------
  Program version:           3.1.7
  Operating system:          macOS
  Operating system name:     macOS
  Operating system version:  26.5.1
  End-of-life:               알수없음
  Kernel version:            25.5.0
  Hardware platform:         x86_64
  Hostname:                  MacBook-Pro
  ---------------------------------------------------
  Profiles:                  /usr/local/Cellar/lynis/3.1.7/default.prf
  Log file:                  /var/log/lynis.log
  Report file:               /var/log/lynis-report.dat
  Report version:            1.0
  Plugin directory:          /usr/local/Cellar/lynis/3.1.7/plugins
  ---------------------------------------------------
  Auditor:                   [Not Specified]
  Language:                  ko
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
 참고: 플러그인은 광범위한 테스트를 거치며 완료될 때까지 몇 분의 시간이 소요됩니다

  - Plugin: pam
    [..]
  - Plugin: systemd
    [................]

[+] Boot and services
------------------------------------
  - Service Manager                                           [ launchd ]

[+] Kernel
------------------------------------

[+] 메모리와 프로세스
------------------------------------
  - Searching for dead/zombie processes                       [ 발견되지않음 ]
  - Searching for IO waiting processes                        [ 발견되지않음 ]

[+] Users, Groups and Authentication
------------------------------------
  - Administrator accounts                                    [ OK ]
  - Unique UIDs                                               [ OK ]
  - Unique group IDs                                          [ OK ]
  - Unique group names                                        [ OK ]
  - Password hashing methods                                  [ OK ]
  - Query system users (non daemons)                          [ 완료 ]
  - Sudoers file(s)                                           [ 발견 ]
    - Permissions for directory: /etc/sudoers.d               [ 경고 ]
    - Permissions for: /etc/sudoers                           [ OK ]
  - PAM password strength tools                               [ 추천 ]
  - PAM configuration file (pam.conf)                         [ 발견되지않음 ]
  - PAM configuration files (pam.d)                           [ 발견 ]
  - LDAP module in PAM                                        [ 발견되지않음 ]
  - Determining default umask
    - umask (/etc/profile and /etc/profile.d)                 [ OK ]

[+] Kerberos
------------------------------------
  - Check for Kerberos KDC and principals                     [ 발견되지않음 ]

[+] Shells
------------------------------------
  - Checking shells from /etc/shells
    Result: found 7 shells (valid shells: 7).
    - Session timeout settings/tools                          [ 없음 ]
  - Checking default umask values
    - Checking default umask in /etc/bashrc                   [ 없음 ]
    - Checking default umask in /etc/csh.cshrc                [ 없음 ]
    - Checking default umask in /etc/profile                  [ 없음 ]

[+] File systems
------------------------------------
  - Checking mount points
    - Checking /home mount point                              [ SYMLINK ]
    - Checking /tmp mount point                               [ SYMLINK ]
    - Checking /var mount point                               [ SYMLINK ]
  - Checking for old files in /tmp                            [ OK ]
  - Checking /var/tmp sticky bit                              [ OK ]

[+] USB Devices
------------------------------------

[+] Storage
------------------------------------

[+] NFS
------------------------------------
  - Query rpc registered programs                             [ 완료 ]
  - Query NFS versions                                        [ 완료 ]
  - Query NFS protocols                                       [ 완료 ]
  - Check running NFS daemon                                  [ 발견되지않음 ]

[+] Name services
------------------------------------
  - Searching DNS domain name                                 [ 발견 ]
      Domain name: local
  - Checking /etc/hosts
    - Duplicate entries in hosts file                         [ 없음 ]
    - Presence of configured hostname in /etc/hosts           [ 발견되지않음 ]
    - Hostname mapped to localhost                            [ 발견되지않음 ]

[+] Ports and packages
------------------------------------
  - Searching package managers
    - Searching brew                                          [ 발견 ]
    - Querying brew for installed packages
Error: Running Homebrew as root is extremely dangerous and no longer supported.
As Homebrew does not drop privileges on installation you would be giving all
build scripts full access to your system.
    - Querying macOS Apps in /Applications
    - Querying Apple CoreServices
  - Checking package audit tool                               [ 없음 ]

[+] Networking
------------------------------------
  - Checking configured nameservers
    - Testing nameservers
        Nameserver: 168.126.63.1                              [ OK ]
        Nameserver: 168.126.63.2                              [ OK ]
    - Minimal of 2 responsive nameservers                     [ OK ]
  - Checking default gateway                                  [ 완료 ]
  - Getting listening ports (TCP/UDP)                         [ 완료 ]
  - Checking waiting connections                              [ OK ]
  - Checking status DHCP client                               [ NOT ACTIVE ]

[+] Printers and Spools
------------------------------------
  - Checking cups daemon                                      [ 발견되지않음 ]
  - Checking lp daemon                                        [ 동작하지않음 ]

[+] Software: e-mail and messaging
------------------------------------

[+] Software: firewalls
------------------------------------
  - Checking pf status (pfctl)                                [ 활성화됨 ]
    - Checking pf configuration consistency                   [ OK ]
  - Checking host based firewall                              [ ACTIVE ]

[+] Software: webserver
------------------------------------
  - Checking Apache (binary /usr/sbin/httpd)                  [ 발견 ]
      Info: Configuration file found (/private/etc/apache2/httpd.conf)
      Info: Found 8 virtual hosts
    * Loadable modules                                        [ 발견 (114) ]
        - Found 114 loadable modules
          mod_evasive: anti-DoS/brute force                   [ 발견되지않음 ]
          mod_reqtimeout/mod_qos                              [ 발견 ]
          ModSecurity: web application firewall               [ 발견되지않음 ]
  - Checking TraceEnable setting in:
      /etc/apache2/httpd.conf                                 [ 발견 ]
      /etc/apache2/original/httpd.conf                        [ 발견 ]
      /etc/apache2/original/extra/httpd-languages.conf        [ 발견되지않음 ]
      /etc/apache2/original/extra/httpd-dav.conf              [ 발견되지않음 ]
      /etc/apache2/original/extra/httpd-autoindex.conf        [ 발견되지않음 ]
      /etc/apache2/original/extra/httpd-manual.conf           [ 발견되지않음 ]
      /etc/apache2/original/extra/httpd-multilang-errordoc.conf  [ 발견되지않음 ]
      /etc/apache2/original/extra/httpd-vhosts.conf           [ 발견되지않음 ]
      /etc/apache2/original/extra/httpd-userdir.conf          [ 발견되지않음 ]
      /etc/apache2/original/extra/httpd-info.conf             [ 발견되지않음 ]
      /etc/apache2/original/extra/httpd-ssl.conf              [ 발견되지않음 ]
      /etc/apache2/original/extra/httpd-default.conf          [ 발견되지않음 ]
      /etc/apache2/original/extra/proxy-html.conf             [ 발견되지않음 ]
      /etc/apache2/original/extra/httpd-mpm.conf              [ 발견되지않음 ]
      /etc/apache2/other/php7.conf                            [ 발견되지않음 ]
      /etc/apache2/other/mpm.conf                             [ 발견되지않음 ]
      /etc/apache2/extra/httpd-languages.conf                 [ 발견되지않음 ]
      /etc/apache2/extra/httpd-dav.conf                       [ 발견되지않음 ]
      /etc/apache2/extra/httpd-autoindex.conf                 [ 발견되지않음 ]
      /etc/apache2/extra/httpd-manual.conf                    [ 발견되지않음 ]
      /etc/apache2/extra/httpd-multilang-errordoc.conf        [ 발견되지않음 ]
      /etc/apache2/extra/httpd-vhosts.conf                    [ 발견되지않음 ]
      /etc/apache2/extra/httpd-userdir.conf                   [ 발견되지않음 ]
      /etc/apache2/extra/httpd-info.conf                      [ 발견되지않음 ]
      /etc/apache2/extra/httpd-ssl.conf                       [ 발견되지않음 ]
      /etc/apache2/extra/httpd-default.conf                   [ 발견되지않음 ]
      /etc/apache2/extra/proxy-html.conf                      [ 발견되지않음 ]
      /etc/apache2/extra/httpd-mpm.conf                       [ 발견되지않음 ]
      /etc/apache2/users/jeongsuryu.conf                      [ 발견되지않음 ]
  - Checking nginx                                            [ 발견되지않음 ]

[+] SSH Support
------------------------------------
  - Checking running SSH daemon                               [ 발견되지않음 ]

[+] SNMP Support
------------------------------------
  - Checking running SNMP daemon                              [ 발견되지않음 ]

[+] Databases
------------------------------------
  - MySQL process status                                      [ 발견 ]

[+] LDAP Services
------------------------------------
  - Checking OpenLDAP instance                                [ 발견되지않음 ]

[+] PHP
------------------------------------
  - Checking PHP                                              [ 발견되지않음 ]

[+] Squid Support
------------------------------------
  - Checking running Squid daemon                             [ 발견되지않음 ]

[+] Logging and files
------------------------------------
  - Checking for a running log daemon                         [ OK ]
    - Checking Syslog-NG status                               [ 발견되지않음 ]
    - Checking systemd journal status                         [ 발견되지않음 ]
    - Checking Metalog status                                 [ 발견되지않음 ]
    - Checking RSyslog status                                 [ 발견되지않음 ]
    - Checking RFC 3195 daemon status                         [ 발견되지않음 ]
  - Checking remote logging                                   [ 활성화됨 ]
  - Checking /etc/newsyslog.conf                              [ 발견 ]
    - Checking log directories (newsyslog.conf)               [ 완료 ]
    - Checking log files (newsyslog.conf)                     [ 완료 ]
  - Checking log directories (static list)                    [ 완료 ]
  - Checking open log files                                   [ 완료 ]
  - Checking deleted files in use                             [ FILES FOUND ]

[+] Insecure services
------------------------------------
    - xinetd status                                           [ NOT ACTIVE ]
  - com.apple.fingerd                                         [ OK ]
  - com.apple.ftp-proxy                                       [ OK ]

[+] Banners and identification
------------------------------------
  - /etc/issue                                                [ 발견되지않음 ]
  - /etc/issue.net                                            [ 발견되지않음 ]

[+] Scheduled tasks
------------------------------------
  - Checking crontab and cronjob files                        [ 완료 ]

[+] Accounting
------------------------------------

[+] Time and Synchronization
------------------------------------
  - NTP daemon found: timed                                   [ 발견 ]
  - Checking for a running NTP daemon or client               [ OK ]

[+] Cryptography
------------------------------------

=================================================================

  Exception found!

  Function/test:  [FileIsReadable]
  Message:        Can not determine symlink /usr/local/share/ca-certificates

  Help improving the Lynis community with your feedback!

  Steps:
  - Ensure you are running the latest version (/usr/local/bin/lynis update check)
  - If so, create a GitHub issue at https://github.com/CISOfy/lynis
  - Include relevant parts of the log file or configuration file

  Thanks!

=================================================================

  - Checking for expired SSL certificates [0/1]               [ 없음 ]
  - FileVault is enabled.                                     [ OK ]

[+] Virtualization
------------------------------------

[+] Containers
------------------------------------
        - Docker status                                       [ 에러 ]
        - Docker info output (warnings)                       [ 2 ]

[+] Security frameworks
------------------------------------
  - Checking presence AppArmor                                [ 발견되지않음 ]
  - Checking presence SELinux                                 [ 발견되지않음 ]
  - Checking presence TOMOYO Linux                            [ 발견되지않음 ]
  - Checking presence grsecurity                              [ 발견되지않음 ]
  - Checking for implemented MAC framework                    [ 없음 ]

[+] Software: file integrity
------------------------------------
  - Checking file integrity tools
    - mtree                                                   [ 발견 ]
  - Checking presence integrity tool                          [ 발견 ]

[+] Software: System tooling
------------------------------------
  - Checking automation tooling
  - Automation tooling                                        [ 발견되지않음 ]
  - Checking for IDS/IPS tooling                              [ 없음 ]

[+] 악성코드
------------------------------------
  - Malware software components                               [ 발견되지않음 ]

[+] File Permissions
------------------------------------
  - Starting file permissions check
    File: /etc/group                                          [ OK ]
    File: /etc/passwd                                         [ OK ]
    File: /etc/ssh/sshd_config                                [ 추천 ]
    File: /etc/hosts.equiv                                    [ OK ]

[+] Home directories
------------------------------------
  - Permissions of home directories                           [ 경고 ]
  - Ownership of home directories                             [ OK ]
  - Checking shell history files                              [ OK ]

[+] Kernel Hardening
------------------------------------

[+] Hardening
------------------------------------
    - Installed compiler(s)                                   [ 발견 ]
    - Installed malware scanner                               [ 발견되지않음 ]

[+] 사용자정의 테스트
------------------------------------
  - Running custom tests...                                   [ 없음 ]

[+] Plugins (phase 2)
------------------------------------
  - Plugins (phase 2)                                         [ 완료 ]

================================================================================

  -[ Lynis 3.1.7 Results ]-

  Great, no warnings

  Suggestions (15):
  ----------------------------
  * Install a PAM module for password strength testing like pam_cracklib or pam_passwdqc or libpam-passwdqc [AUTH-9262]
    - Related resources
      * Article: Configure minimum password length for Linux systems: https://linux-audit.com/configure-the-minimum-password-length-on-linux-systems/
      * Website: https://cisofy.com/lynis/controls/AUTH-9262/

  * Symlinked mount point needs to be checked manually [FILE-6310]
    - Details  : /home
    - Solution :
    - Related resources
      * Website: https://cisofy.com/lynis/controls/FILE-6310/

  * Symlinked mount point needs to be checked manually [FILE-6310]
    - Details  : /tmp
    - Solution :
    - Related resources
      * Website: https://cisofy.com/lynis/controls/FILE-6310/

  * Symlinked mount point needs to be checked manually [FILE-6310]
    - Details  : /var
    - Solution :
    - Related resources
      * Website: https://cisofy.com/lynis/controls/FILE-6310/

  * Add the IP name and FQDN to /etc/hosts for proper name resolving [NAME-4404]
    - Related resources
      * Article: Keeping your /etc/hosts file healthy: https://linux-audit.com/is-your-etc-hosts-file-healthy/
      * Website: https://cisofy.com/lynis/controls/NAME-4404/

  * Install a package audit tool to determine vulnerable packages [PKGS-7398]
    - Related resources
      * Website: https://cisofy.com/lynis/controls/PKGS-7398/

  * Install Apache mod_evasive to guard webserver against DoS/brute force attempts [HTTP-6640]
    - Related resources
      * Website: https://cisofy.com/lynis/controls/HTTP-6640/

  * Install Apache modsecurity to guard webserver against web application attacks [HTTP-6643]
    - Related resources
      * Website: https://cisofy.com/lynis/controls/HTTP-6643/

  * Check what deleted files are still in use and why. [LOGG-2190]
    - Related resources
      * Website: https://cisofy.com/lynis/controls/LOGG-2190/

  * Run 'docker info' to see warnings applicable to Docker daemon [CONT-8104]
    - Related resources
      * Website: https://cisofy.com/lynis/controls/CONT-8104/

  * Determine if automation tools are present for system management [TOOL-5002]
    - Related resources
      * Website: https://cisofy.com/lynis/controls/TOOL-5002/

  * Consider restricting file permissions [FILE-7524]
    - Details  : See screen output or log file
    - Solution : Use chmod to change file permissions
    - Related resources
      * Website: https://cisofy.com/lynis/controls/FILE-7524/

  * Double check the permissions of home directories as some might be not strict enough. [HOME-9304]
    - Related resources
      * Website: https://cisofy.com/lynis/controls/HOME-9304/

  * Harden compilers like restricting access to root user only [HRDN-7222]
    - Related resources
      * Article: Why remove compilers from your system?: https://linux-audit.com/software/why-remove-compilers-from-your-system/
      * Website: https://cisofy.com/lynis/controls/HRDN-7222/

  * Harden the system by installing at least one malware scanner, to perform periodic file system scans [HRDN-7230]
    - Solution : Install a tool like rkhunter, chkrootkit, OSSEC, Wazuh
    - Related resources
      * Article: Antivirus for Linux: is it really needed?: https://linux-audit.com/malware/antivirus-for-linux-really-needed/
      * Article: Monitoring Linux Systems for Rootkits: https://linux-audit.com/monitoring-linux-systems-for-rootkits/
      * Website: https://cisofy.com/lynis/controls/HRDN-7230/

  Follow-up:
  ----------------------------
  - Show details of a test (lynis show details TEST-ID)
  - Check the logfile for all details (less /var/log/lynis.log)
  - Read security controls texts (https://cisofy.com)
  - Use --upload to upload data to central system (Lynis Enterprise users)

================================================================================

  Lynis security scan details:

  Scan mode:
  Normal [▆]  Forensics [ ]  Integration [ ]  Pentest [ ]

  Lynis modules:
  - Compliance status      [?]
  - Security audit         [V]
  - Vulnerability scan     [V]

  Details:
  Hardening index : 72 [##############      ]
  Tests performed : 175
  Plugins enabled : 2

  Software components:
  - Firewall               [V]
  - Intrusion software     [X]
  - Malware scanner        [X]

  Files:
  - Test and debug information      : /var/log/lynis.log
  - Report data                     : /var/log/lynis-report.dat

================================================================================

  예외 발견
  몇 가지 예외 이벤트나 정보가 발견되었습니다!

  할 일:
  로그 파일을 제공하면 도움을 받을 수 있습니다 (/var/log/lynis.log).
  Go to https://cisofy.com/contact/ and send your file to the e-mail address listed

================================================================================

  Notice: No OS entry was found in the end-of-life database

  할 일:
  Please submit a pull request on GitHub to include your OS version and the end date of this OS version is being supported
  URL: https://github.com/CISOfy/lynis

================================================================================

  Lynis 3.1.7

  Auditing, system hardening, and compliance for UNIX-based systems
  (Linux, macOS, BSD, and others)

  2007-2025, CISOfy - https://cisofy.com/lynis/
  Enterprise support available (compliance, plugins, interface and tools)

================================================================================
