# week09 — 보안시스템(IDS) 리포트

> 대상: Suricata + `week09/local.rules`(커스텀 룰 3종)
> 검증 pcap: 정상(`login-plaintext.pcapng`) / 공격(`attack.pcap`, make-attack-pcap.sh 생성)

## 1. 커스텀 룰 3종 (설명)

| sid | 이름 | 핵심 키워드 | 탐지 대상 |
|---|---|---|---|
| 1000002 | SQLi attempt | `http.uri; pcre:"/('|%27)?\s*(OR\s+1=1\|UNION\s+SELECT)/i"` | URI 의 SQLi 패턴(대소문자·공백 유연) |
| 1000003 | portscan | `flags:S; detection_filter:track by_src, count 20, seconds 5` | 5초 내 한 출발지의 다수 SYN |
| 1000004 | login bruteforce | `http.method:POST; http.uri:/login; threshold:… count 10, seconds 30` | 30초 내 /login POST 임계 초과 |

- `pcre …/i` — SQLi 의 다양한 표기를 한 룰로 커버. `http.uri` 는 Suricata 가 URL 디코드·정규화하므로 인코딩 페이로드도 매칭.
- `detection_filter` — 임계 초과 **패킷마다** 알림(스캔에 적합).
- `threshold(type threshold)` — 임계 넘는 순간 **1건만** 알림(브루트포스에 적합).

## 2. 탐지 검증 (공격 pcap, 실측)

`docker compose … run --rm suricata -r /pcaps/attack.pcap -S /rules/local.rules`:

| sid | 시그니처 | 탐지 건수 |
|---|---|---|
| 1000002 | SQLi attempt | 2 (OR 1=1, UNION SELECT 각 1) |
| 1000003 | portscan | 38 |
| 1000004 | login bruteforce | 1 |

→ 3종 모두 정상 탐지.

## 3. 오탐 튜닝 Before/After (실측)

### 관찰 — 정상 pcap 재생 시 포트스캔 룰 폭증
```
sid 1000003 (portscan): 약 42,000+ 건   ← 오탐(false positive)
sid 1000002/1000004: 0                    ← 정상 pcap엔 공격 패턴 없음
```
**원인**: 정상 트래픽에도 SYN 패킷이 매우 많은데, `flags:S` + 카운트 임계 방식이
이를 전부 "스캔"으로 오인. `detection_filter` 는 **패킷 수**만 세고 "목적지 포트 다양성"을 못 센다.

### 튜닝 방향
```
# (a) 임계 상향 + 시간 창 단축 — '짧은 폭주'만
detection_filter:track by_src, count 100, seconds 2;
# (b) 방향 한정 — 외부→내부만
alert tcp $EXTERNAL_NET any -> $HOME_NET any (... flags:S; detection_filter:...; )
```
> 한계: 카운트 기반 SYN 탐지는 **바쁜 정상 호스트와 스캐너를 볼륨만으로 구분 못 한다**.
> 근본 해결은 목적지 포트 다양성 추적/전용 스캔 탐지가 필요 — 이 한계 자체를 분석으로 남긴다.

## 4. 결론

시그니처/임계 룰은 **알려진 패턴·명백한 폭주**를 잘 잡지만, 정상과 공격의 **볼륨이 겹치면**
오탐이 급증한다. 룰은 문맥(`http.uri`, `nocase`)으로 좁히고, 정상 트래픽으로 **오탐을 반드시 튜닝**한다.
`sid` 는 고유하게(로컬 대역 1000000+) 관리한다.
