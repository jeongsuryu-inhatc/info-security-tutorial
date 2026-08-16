# grading/ — 조교용 채점 자동화

코드 주차(4·5·6·7·8)는 스크립트로 기능/보안 정확성을 자동 채점하고, 분석 주차는
`../solutions/answer-keys/` 정답지 + `rubric.md`로 수동 채점한다.

## 구성

| 파일 | 용도 |
|---|---|
| `grade-week04.cjs` | SQLi 패치 검증(정상로그인/우회차단) |
| `grade-week05.cjs` | 입력검증 3종 + 회귀 |
| `grade-week06.cjs` | 시그니처 스캐너 탐지(EICAR·문자열·오탐) |
| `grade-week07.cjs` | bcrypt 마이그레이션 + AES 왕복/변조감지 |
| `grade-week08.cjs` | IDOR 차단 + 가격 재계산 |
| `check-files.sh` | 제출물 필수 파일 존재 점검(전 주차) |
| `apply-solution.sh` | 모범답안 적용본 생성(하니스 자가점검) |
| `run-all.sh` | 코드 주차 일괄 채점 |
| `rubric.md` | 자동/수동 배점표 |
| `lib.cjs` | 공용 헬퍼 |

## 사전 준비

각 스크립트는 대상 앱에 `node_modules`가 있어야 한다(학생이 `npm install` 한 상태).
grader는 실행 시 `npm run seed`로 **DB를 결정적으로 초기화**한 뒤 채점한다.

## 학생 제출물 채점

```bash
# 1) 파일 존재 점검
grading/check-files.sh /path/to/제출루트

# 2) 코드 주차 자동채점 (학생의 shopguard-app 디렉터리 지정)
cd /path/to/학생/shopguard-app && npm install    # 최초 1회
grading/run-all.sh /path/to/학생/shopguard-app

# 개별 실행도 가능
node grading/grade-week04.cjs /path/to/학생/shopguard-app
```

> 7주차는 학생이 `auth.js`를 bcrypt 로그인으로 교체했다고 가정한다. 교체하지 않았으면
> "bcrypt 로그인 동작" 항목이 FAIL로 표시된다(정상 동작).

## 하니스 자가 점검 (모범답안 = 만점 확인)

```bash
grading/apply-solution.sh /tmp/solved-app
cd /tmp/solved-app && npm install && npm run seed
grading/run-all.sh /tmp/solved-app
# 4·5·6·8주차 만점, 7주차는 auth 교체 후 만점:
cp ../solutions/shopguard-app-secure/auth-bcrypt.js /tmp/solved-app/auth.js
node grading/grade-week07.cjs /tmp/solved-app
```

## 주의
- 자동채점은 **부분점수**다. 보고서·분석·재현성은 `rubric.md`로 수동 채점한다.
- grader는 대상 앱의 `shopguard.sqlite`를 재시드하므로, 채점 전 학생 원본 DB는 백업하거나
  제출물 사본에서 실행한다.
