# EMAIL ANALYSIS TOOL
Typescript because meh



### [ NOTE: demo application ]
> [!WARNING]
> The goal of this application was to use your **gmail api**. </br>
> Process : Fetch the gmail -> Read the gmail ->  Analyze and ouput </br>
> But based on [Google's API Biling](https://support.google.com/googleapi/answer/6158867?hl=en&ref_topic=7013279&sjid=17315915535892950383-EU), its not free, so called free ones are limited to a certain usage </br>
> Hence this is scrapped, i could use another email service, but i don't use them. </br>
> hence this is a demo application.

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
- before running, create `.env` file in the root dir and fill in the api's keys
```
GEMINI_API_KEY=.... # this is your gemini api key 
API_KEY=...         # this is from ipqualityscore.com 
```

# Usage

###### i don't know how you'd use it honestly, this is a demo app

-   `--demo / -d` to use the demo Email in the source code
-   `--body <email-body> & --sender <email-sender> & --Subject <email-subject>` to use yours
-   `--noAI / -n` doesn't use ai. **below is a example output if it doesn't use ai**

    ```txt
    EMAIL CHECK : Success.

    Spelling Errors : 4
    Sender Address Verification : PASS
    Subject Analysis : PASS
    Subject Analysis Infomation:
    No Issue found with Subject
    Body Analysis : PASS
    Body Analysis Infomation:
    No Issue found with email body
    Overall Risk : MID
    ```

-   `--Ai / -a` use Gemini ai to analyze
