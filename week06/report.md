# week06 — 악성코드 분석 & 시그니처 한계 리포트

> 대상: EICAR 테스트 파일 + 교육용 가짜 샘플 3종(`starter/malware-lab/samples/`)
> 도구: `week06/scanner.js`(해시+문자열 시그니처), `rules.json`

## 1. 정적 분석 (EICAR)

```bash
file eicar.com        # → EICAR virus test files
sha256sum eicar.com   # → 275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f
```
- SHA-256 이 `rules.json` 블랙리스트와 일치 → 알려진 샘플로 판정.
- VirusTotal 은 **해시만** 조회(파일 업로드 금지) → 여러 백신이 `EICAR-Test-File` 로 탐지.

## 2. 시그니처 스캐너 탐지 결과 (실측)

`node scanner.js ./samples` (샘플 3종):

| 파일 | 매칭 룰 | 유형 | 심각도 |
|---|---|---|---|
| sample_A | wget-pipe-sh (`curl … \| sh`) | string | HIGH |
| sample_B | js-eval-atob (`eval(atob(`) | string | HIGH |
| sample_B | base64-blob(대용량 Base64) | string | LOW |
| sample_C | ps-encoded (`powershell -enc`) | string | HIGH |
| eicar.com | EICAR-Test-File | hash | HIGH |

정상 파일(`clean.txt`)은 **오탐 없음**.

## 3. 시그니처 방식의 한계 (우회 시연)

EICAR 를 Base64 로 감싸면(패킹) **해시가 바뀌고 원문 문자열도 사라져** 탐지를 회피한다.
```bash
base64 < eicar.com > eicar.packed.b64
node scanner.js ./test-folder     # eicar.packed.b64 → 미탐(hash·string 모두 회피)
```
- **해시 시그니처**: 1바이트만 바뀌어도 무력화(변종·패킹에 취약).
- **문자열 시그니처**: 인코딩·난독화로 우회. 광범위한 룰(`content:"SELECT"`)은 오탐 폭증.
- **공통**: 제로데이(미지 샘플)는 원천적으로 미탐.

## 4. 행위 기반/휴리스틱과의 비교

| 방식 | 강점 | 약점 |
|---|---|---|
| 시그니처 | 빠름·정확(알려진 것) | 변종·패킹·제로데이 미탐 |
| 휴리스틱/행위 | 미지 위협·변종 탐지 | 오탐↑, 실행/샌드박스 비용 |

> 결론: 시그니처는 **1차 필터**로 유효하나, 디코딩 단계 추가·행위 분석·다층 방어로 보완해야 한다.
> (예: 스캐너에 Base64 디코드 후 재검사 단계를 추가하면 위 패킹 우회를 재탐지 가능.)

## 5. 안전 수칙 준수

- 모든 분석은 **네트워크 차단 격리 환경**(`starter/malware-lab`, `network_mode: none`)에서 수행.
- 컨테이너 안에서 `getent hosts example.com` 실패(네트워크 없음)로 격리 확인.
- VirusTotal 은 해시만 조회(파일 미업로드).
