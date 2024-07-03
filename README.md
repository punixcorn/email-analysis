# EMAIL VERIFIER
Typescript because meh

### NB demo application

# build 
- clone
```
git clone https://github.com/punixcorn/email-verifier
```
- build  & run
```
cd email-verifier
npm install
npm run dev
```
- before running, fill in the api's in `.env`
```
GEMINI_API_KEY=....
API_KEY=... ( this is for ipqualityscore.com) :w
```
# Usage

i don't know how you'd use it honestly

-   `--demo / -d` to use the demo Email in the source code
-   `--body & --sender & --Subject` to use yours
-   `--noAI / -n` doesn't use ai below is a example if it doesn't use ai

    ```txt
    EMAIL CHECK : Success.

    Spelling Errors : 4
    Sender Address Verification : PASS
    Subject Analysis : PASS
    Subject Analysis Infomation:
    ,No Issue found with Subject
    Body Analysis : PASS
    Body Analysis Infomation:
    ,No Issue found with email body
    Overall Risk : MID
    ```

-   `--Ai / -a` use Gemini ai to analyze
