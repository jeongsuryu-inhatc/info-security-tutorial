# starter/ — 주차별 실습 스타터 자산

각 파일은 해당 주차 명세서(`labs/NN-*.md`)의 "수업 중 랩" Step에서 사용한다.

| 경로 | 주차 | 용도 |
|---|---|---|
| `shopguard-assets.csv` | 1 | 자산 목록 초안(학생이 CIA 채움) |
| `shopguard-web.Dockerfile` | 2 | 취약 웹서버(하드닝 대상) |
| `shopguard-net/` | 3 | 평문 로그인 서버 + 스캔 대상(compose) |
| `shopguard-app/` | 4·5·7·8 | 취약 Express+SQLite 앱(SQLi·유틸·IDOR·가격조작) |
| `sample-hashes.json` | 6 | 시그니처 스캐너 룰셋 |
| `crypto/caesar-cipher.txt` | 7 | 고전 암호 크래킹 대상 |
| `suricata/` | 9 | IDS(compose + local.rules) |
| `iot/` | 10 | MQTT 브로커+취약 기기(compose) |
| `ai/classifier.py` | 10 | FGSM 적대적 예제 |
| `incident/` | 11 | 침해사고 로그 번들 |
| `phishing/` | 12 | 익명화된 교육용 피싱 `.eml` 3건 |
| `risk-matrix-template.csv` | 13 | 위험평가 매트릭스 템플릿 |

## 공통 주의

- `shopguard-web.Dockerfile`, `shopguard-app/`, `iot/`, `phishing/` 등은 **의도적으로 취약**하다.
  로컬 격리 환경에서 학습용으로만 사용하고 절대 공개 배포하지 않는다.
- `shopguard-app/`은 4·5·7·8주차가 공유한다. 한 번 `npm install && npm run seed` 하면 재사용된다.
