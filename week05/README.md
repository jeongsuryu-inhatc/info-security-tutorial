
ShopGuard 프로젝트의 소스 코드를 정적 분석(SAST) 했을 때 발견된 보안 취약점 경고
1.CSRF 방어 미적용
2.Path Traversal(경로 조작) 가능성
3.Command Injection(명령어 주입) 가능성


. Express에 CSRF 방어가 없음

문제 위치:

/src/starter/shopguard-app/server.js


12┆ const app = express();

검사 결과:

A CSRF middleware was not detected in your express application.

즉, Express 애플리케이션에서 CSRF(Cross-Site Request Forgery) 방어 로직을 찾지 못했다는 의미입니다.

CSRF란?

공격자가 사용자가 로그인한 상태라는 점을 이용하여 사용자의 브라우저에서 원하지 않는 요청을 서버로 보내게 만드는 공격입니다.

예를 들어 사용자가 쇼핑몰에 로그인한 상태라고 가정합니다.

정상적인 요청:

POST /account/change-password

사용자가 비밀번호를 변경합니다.

그런데 공격자가 다음과 같은 페이지를 만들어 놓습니다.

<form action="https://shop.example.com/account/change-password"
      method="POST">
    <input type="hidden" name="password" value="hacker123">
</form>


<script>
document.forms[0].submit();
</script>

사용자가 공격자의 페이지를 방문하면 브라우저가 요청을 보내려고 합니다.

서버가 별도의 CSRF 검증을 하지 않는다면 공격자가 의도한 요청이 실행될 가능성이 있습니다.

2. CSRF Token 방식

가장 일반적인 방법은 CSRF Token을 사용하는 것입니다.

서버가 랜덤한 토큰을 생성합니다.

사용자 → 서버


        CSRF Token 생성
              ↓
        8f7a9c...
              ↓
사용자에게 HTML 전달

HTML:

<form method="POST" action="/account/change-password">


    <input
        type="hidden"
        name="_csrf"
        value="8f7a9c..."
    >


    <input type="password" name="password">


    <button>변경</button>
</form>

그리고 POST 요청이 들어오면 서버가 토큰을 검증합니다.

POST /account/change-password


_csrf=8f7a9c...

토큰이 없거나 잘못되었다면:

403 Forbidden

으로 차단합니다.

3. csurf 또는 csrf 사용

검사 메시지에서:

Ensure you are either using one such as `csurf` or `csrf`

라고 안내하고 있습니다.

다만 여기서 중요한 점이 있습니다.

현재 Express 생태계에서는 무조건 csurf를 새 프로젝트에 추가하는 방식보다는 애플리케이션의 인증 방식과 프레임워크 구조에 맞춰 CSRF 방어를 설계하는 것이 좋습니다.

예를 들어:

세션 기반 인증 → CSRF Token이 일반적으로 필요
Cookie 기반 인증 → CSRF 방어 중요
Authorization: Bearer ... 기반 API → 일반적인 CSRF 공격 모델과 다름
SameSite Cookie → CSRF 위험을 줄이는 추가 방어책

따라서 ShopGuard가 EJS + Express + Session/Cookie 기반 웹 애플리케이션인지 확인한 후 적용하는 것이 좋습니다.

4. Path Traversal 취약점

두 번째 문제입니다.

파일:

/src/starter/shopguard-app/utils.js

코드:

return fs.readFileSync(
    path.join(__dirname, 'uploads', name),
    'utf8'
);

정적 분석기가 다음을 발견했습니다.

Detected possible user input going into a
path.join or path.resolve function.

핵심은 name입니다.

path.join(__dirname, 'uploads', name)

여기서 name이 사용자의 입력값이라면 문제가 됩니다.

5. Path Traversal이란?

Path Traversal은 공격자가 ../ 등을 이용해서 원래 접근하지 못하도록 해야 하는 파일에 접근하는 공격입니다.

예를 들어 정상적인 요청:

name = "test.txt"

이면:

/uploads/test.txt

가 됩니다.

그런데 공격자가:

name = "../../secret.txt"

를 전달하면 문제가 발생할 수 있습니다.

개념적으로:

/uploads/../../secret.txt

→

/secret.txt

처럼 경로가 변경될 수 있습니다.

더 위험한 경우에는:

../../../../etc/passwd

같은 입력이 사용될 수 있습니다.

6. 현재 코드의 문제

현재 코드는 사실상 다음과 같습니다.

function readFile(name) {
    return fs.readFileSync(
        path.join(__dirname, 'uploads', name),
        'utf8'
    );
}

여기에는 다음과 같은 검증이 없습니다.

name
 ↓
검증?
 ↓
path.join()
 ↓
파일 접근

안전한 구조는:

사용자 입력
   ↓
파일명 검증
   ↓
허용된 경로인지 확인
   ↓
파일 접근

입니다.

7. 안전한 Path Traversal 방어

가장 확실한 방법 중 하나는 최종 경로가 uploads 디렉터리 내부에 있는지 검사하는 것입니다.

예:

const path = require('path');
const fs = require('fs');


function readUpload(name) {
    const uploadDir = path.resolve(__dirname, 'uploads');
    const filePath = path.resolve(uploadDir, name);


    if (!filePath.startsWith(uploadDir + path.sep)) {
        throw new Error('Invalid file path');
    }


    return fs.readFileSync(filePath, 'utf8');
}

핵심은:

const uploadDir = path.resolve(__dirname, 'uploads');

그리고:

const filePath = path.resolve(uploadDir, name);

후에:

if (!filePath.startsWith(uploadDir + path.sep)) {
    throw new Error('Invalid file path');
}

로 검사하는 것입니다.

8. 더 좋은 방법: 파일 ID 사용

실제 서비스에서는 사용자가 파일의 실제 경로를 직접 지정하도록 하는 것보다 다음과 같이 하는 것이 좋습니다.

예를 들어 사용자가:

GET /download?id=123

라고 요청하면 DB에서:

id: 123
filename: abc123.png

를 가져옵니다.

즉:

사용자
 ↓
파일 ID
 ↓
DB 조회
 ↓
서버가 관리하는 실제 파일명
 ↓
파일 접근

이 구조가 훨씬 안전합니다.

9. Command Injection 취약점

세 번째 문제입니다.

return execSync(`echo convert ${file} thumb.png`).toString();

정적 분석기가:

Detected calls to child_process

라고 경고했습니다.

여기가 가장 위험합니다.

10. 왜 위험한가?

execSync()는 운영체제의 Shell 명령을 실행합니다.

예를 들어:

execSync(`echo convert ${file} thumb.png`);

정상적인 입력:

file = "photo.jpg"

이면:

echo convert photo.jpg thumb.png

입니다.

문제는 file이 사용자 입력이라면 공격자가 Shell 문법을 넣을 수 있다는 것입니다.

예를 들어 개념적으로:

photo.jpg; 공격자가 원하는 명령

같은 입력이 들어가면 Shell이 이를 별개의 명령으로 해석할 가능성이 있습니다.

즉:

사용자 입력
     ↓
file
     ↓
Template Literal
     ↓
execSync()
     ↓
Shell

이라는 구조가 위험합니다.

11. 가장 중요한 원칙

다음 코드는 피해야 합니다.

execSync(`command ${userInput}`);

또는:

exec(`command ${userInput}`);

또는:

spawn(`command ${userInput}`, {
    shell: true
});

사용자 입력을 Shell 명령 문자열에 직접 넣는 구조이기 때문입니다.

12. execFile() 또는 spawn() 사용

외부 프로그램을 실행해야 한다면 가능하면 Shell을 거치지 않는 방식을 사용합니다.

예를 들어 ImageMagick의 convert를 실행한다고 가정하면:

const { execFileSync } = require('child_process');


const result = execFileSync(
    'convert',
    [file, 'thumb.png'],
    { encoding: 'utf8' }
);

여기서는:

convert
[file]
[thumb.png]

가 별도의 argument로 전달됩니다.

따라서 Shell 문자열:

convert ${file} thumb.png

을 만드는 것보다 안전합니다.

단, file 자체가 허용된 파일인지에 대한 검증은 여전히 필요합니다.

13. 세 가지 취약점을 한 번에 이해하기

현재 ShopGuard 코드의 문제를 구조적으로 보면 다음과 같습니다.

                    사용자 입력
                        │
          ┌─────────────┼──────────────┐
          │             │              │
          ▼             ▼              ▼
        CSRF          파일명          명령어
          │             │              │
          ▼             ▼              ▼
       POST 요청     path.join()    execSync()
          │             │              │
          ▼             ▼              ▼
     요청 위조      Path Traversal   Command Injection

각각의 대응 방법은 다음과 같습니다.

취약점	원인	대응
CSRF	요청의 출처/토큰 검증 부족	CSRF Token, SameSite Cookie 등
Path Traversal	사용자 입력을 파일 경로에 직접 사용	resolve() 후 base directory 검증, allowlist
Command Injection	사용자 입력을 Shell 명령에 삽입	execFile()/spawn() + 입력 검증
파일 접근	임의 파일명 사용	서버가 생성한 ID/파일명 사용
14. ShopGuard 프로젝트에서는 이렇게 수정하는 것이 좋습니다

현재 구조를 기준으로 하면:

shopguard-app/
├── server.js
├── utils.js
├── uploads/
├── routes/
├── views/
├── public/
└── package.json
server.js

CSRF 방어를 추가합니다.

const express = require('express');


const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

그리고 현재 프로젝트의 세션/인증 방식에 맞는 CSRF middleware 또는 직접 구현한 CSRF 검증을 적용합니다.

utils.js

기존:

return fs.readFileSync(
    path.join(__dirname, 'uploads', name),
    'utf8'
);

수정:

const path = require('path');
const fs = require('fs');


function readUpload(name) {
    const uploadDir = path.resolve(__dirname, 'uploads');
    const filePath = path.resolve(uploadDir, name);


    if (!filePath.startsWith(uploadDir + path.sep)) {
        throw new Error('Invalid file path');
    }


    return fs.readFileSync(filePath, 'utf8');
}
execSync() 제거

기존:

return execSync(
    `echo convert ${file} thumb.png`
).toString();

가능하면:

const { execFileSync } = require('child_process');


return execFileSync(
    'convert',
    [file, 'thumb.png'],
    { encoding: 'utf8' }
);

그리고 file에 대한 파일 경로 검증도 추가합니다.

15. 이 보안 검사 결과에서 특히 주의할 점

이 검사는 단순히 "문법이 잘못됐다"는 의미가 아닙니다.

예를 들어:

❱ javascript.lang.security.audit.path-traversal

는 소스 코드의 데이터 흐름을 분석해서

사용자 입력
    ↓
name
    ↓
path.join()
    ↓
fs.readFileSync()

라는 위험한 흐름이 존재할 가능성을 찾아낸 것입니다.

마찬가지로:

사용자 입력
    ↓
file
    ↓
Template Literal
    ↓
execSync()
    ↓
Shell

이라는 흐름도 발견한 것입니다.

따라서 ShopGuard를 웹 애플리케이션 보안 교육용 프로젝트로 사용한다면 이 3개는 상당히 좋은 실습 주제가 됩니다.

실습 1
CSRF 공격 → CSRF Token 적용 → 공격 차단


실습 2
Path Traversal 공격 → ../ 이용한 파일 접근 시도
             → path.resolve() + 경로 검증
             → 공격 차단


실습 3
Command Injection → execSync() 취약 코드
                  → execFile() 변경
                  → 명령어 주입 차단

특히 utils.js의 두 취약점은 실제 공격으로 이어질 가능성이 있으므로 먼저 수정하는 것을 권장합니다. server.js와 utils.js의 전체 코드를 보여주시면, 현재 ShopGuard 구조를 유지하면서 취약한 코드 → 공격 시나리오 → 안전한 코드로 수정하는 형태로 정확히 분석해드릴 수 있습니다.


