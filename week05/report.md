# week05 — 코드보안 정적분석 Before/After 리포트

> 대상: `starter/shopguard-app/utils.js` (취약 유틸 3종)
> 산출: `utils-safe.js`(안전본), `utils-test.js`(회귀 12종), `semgrep-*.txt`

## 1. 정적분석(Semgrep) 결과

| 시점 | Findings | 비고 |
|---|---|---|
| Before (`semgrep-before.txt`) | **3 (blocking)** | 취약 함수 3종에 대응 |
| After (`semgrep-after.txt`) | 잔여 경고 확인 | `execFileSync` 도 `child_process` 로 분류되어 heuristic 상 경고가 남을 수 있음 |

> 해석: Semgrep 의 `child_process` 룰은 **셸 사용 여부와 무관하게** 호출 자체를 표시하는 경향이 있다.
> 따라서 "경고 0"이 아니라 **회귀 테스트 통과(악성 입력 거부)** 가 수정의 실질 증거다(아래 3절).

## 2. 취약점 3종 — 원리와 수정

| # | 취약점 | 원리 | 수정 |
|---|---|---|---|
| 1 | 경로 순회 | `path.join(dir, name)` 에 `../../etc/passwd` 주입 → 업로드 폴더 밖 파일 읽기 | 파일명 화이트리스트(`zod /^[A-Za-z0-9._-]+$/`) + 정규화 후 디렉터리 봉쇄(이중 방어) |
| 2 | 커맨드 인젝션 | `execSync("echo ... "+file)` 가 셸을 거쳐 `; \| $() \`` 해석 | `execFileSync`(셸 미사용, 인자 배열) + 동일 스키마 검증 |
| 3 | 프로토타입 오염 | `for..in` 순회로 `__proto__` 대입 → `Object.prototype` 오염 | 위험 키(`__proto__/constructor/prototype`) 차단, `Object.keys` 순회 |

핵심: 화이트리스트 스키마 하나가 **경로 순회 + 커맨드 인젝션을 동시에** 막는다(디렉터리 구분자·상위경로·셸 메타문자 모두 거부).

## 3. 회귀 테스트 (수정의 실질 증거)

`utils-test.js` — 악성 입력 거부 / 정상 입력 통과, 총 12종.
```
node --test utils-test.js
# ... pass 12, fail 0
```
- 경로순회: `../../../etc/passwd`, `sub/x.txt`, `/etc/passwd`, 빈값/비문자열 → **거부**, 정상 파일 → 통과
- 커맨드: `a.png; id`, `$(whoami).png`, `` `id`.png ``, 파이프/리다이렉트 → **거부**, `photo_01.png` → 통과
- 오염: `__proto__`, `constructor.prototype` → 전역 미오염, 정상 중첩 병합 → 통과

## 4. 결론

정적분석은 **의심 지점을 빠르게 지목**하지만 오탐/잔여경고가 있어, 최종 판정은
**동작(회귀 테스트)** 으로 확인해야 한다. 블랙리스트(`replace('..','')`)는 `....//` 로 우회되므로
반드시 정규화 후 화이트리스트 검증을 쓴다.
