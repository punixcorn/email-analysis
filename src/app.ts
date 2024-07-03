/*
 * one of my out of the pocket codes ever.
 * Email verification. punixcorn@2024
 * I dunno how... but it works when it works,
 * I don't know what the structure of this code is...
 * Getting Email's through google's api sucks.
 * You need to go spwan a google cloud instance,
 * web scrapping too sucks
 * So this isn't for public use
 * remove line 254 - 257 to use the demo email to test this app
 * I added a demo mode --demo / -d no need to edit the lines
 */

/* loading Animation */
import { loadingAnimation } from './loadingAnimation';
/* rendering markdown to terminal */
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

import dotenv from 'dotenv';
dotenv.config();

/* custom types  and data */
import { Analysis, Email, IpsEmailResponse, Results } from './types';
import { SUS, COMMONDOMAINS } from './data/data';

import { exit } from 'process';
import { run } from './useGemini';
import { parseArgs } from 'util';
const en_word_dictionary = require('an-array-of-english-words'); // import doesn't work

class EmailAnalyzer {
    private common_domains: string[];
    private sus_words: string[];
    public API = process.env.API_KEY;
    public baseURL = `https://www.ipqualityscore.com/api/json/email`;

    constructor(
        public Sus_words: string[] | null,
        public Common_domains: string[] | null,
    ) {
        this.sus_words = Sus_words ?? (SUS as string[]);
        this.Common_domains = Common_domains ?? (COMMONDOMAINS as string[]);
    }

    public checkSpelling = (text: string): number => {
        const words: string[] = text.toLowerCase().match(/\w+/g) || [''];
        const dictionary: string[] = en_word_dictionary;
        /* return words that didn't match in the dictionary */
        return words.filter((word: string) => !dictionary.find((dicIndex) => dicIndex === word)).length;
    };

    /*print a full report on the Email*/
    public analyzeEmail = async (email?: Email): Promise<Results> | null => {
        if (email === undefined || email === null) {
            return null;
        }
        /* our person checks */
        let results: Results = {
            spellingErrors: this.checkSpelling(email.body),
            subjectAnalysis: this.analyzeSubject(email),
            bodyAnalysis: this.analyzeBody(email),
        };

        /* do api check on the sender */
        await this.verifySender(email)
            .then((status) => {
                results.senderVerification = status;
            })
            .catch((err) => {
                console.log(err.message);
                exit(1);
            });

        /* some riskScore calculator */
        const riskScore: number =
            results.spellingErrors * 2 +
            ((results.senderVerification as boolean) ? 0 : 5) +
            results.subjectAnalysis.messages.length +
            results.bodyAnalysis.messages.length;

        if (riskScore > 20) {
            results.overallRisk = 'HIGH';
        } else if (riskScore > 10) {
            results.overallRisk = 'MID';
        } else {
            results.overallRisk = 'LOW';
        }

        console.log(
            `Spelling Errors : ${results?.spellingErrors ?? 'NULL'}\n` +
                `Sender Address Verification : ${(results?.senderVerification as boolean) ? 'PASS' : 'FAIL ( sometimes it fails for no reason, dumb api)'}\n` +
                `Subject Analysis : ${results?.subjectAnalysis.result}\n` +
                `Subject Analysis Infomation:\n` +
                `${results?.subjectAnalysis.messages.map((each) => `${each}`)}` +
                `Body Analysis : ${results?.bodyAnalysis.result}\n` +
                `Body Analysis Infomation:\n` +
                `${results?.bodyAnalysis.messages.map((each) => `${each}`)}` +
                `Overall Risk : ${results?.overallRisk}`,
        );
        return results;
    };

    /* verify Sender using and API */
    public verifySender = async (email: Email): Promise<boolean | null> => {
        if (this.API === undefined || this.API === '') {
            console.log(`API key not defined`);
            exit(-1);
        }
        const link: string = `${this.baseURL}/${this.API}/${email.sender}`;
        let ipsfetch: Response;
        let response: IpsEmailResponse;
        try {
            ipsfetch = await fetch(link);
            response = (await ipsfetch.json()) as IpsEmailResponse;
            console.log(`EMAIL CHECK : ${response.message}\n`);
        } catch (e) {
            console.log(e.message);
            exit(-1);
        }
        return response.valid;
    };

    /* finds a suspicious word and checks if the string is all CAPS*/
    public analyzeSubject = (email: Email): Analysis => {
        let ret: Analysis = {
            messages: [''],
            result: 'PASS',
        };

        if (email.subject === email.subject.toUpperCase()) {
            ret.messages?.push('All caps subject\n');
            ret.result = 'FAIL';
        }
        if (this.sus_words.some((word) => email.subject.toLowerCase().includes(word))) {
            ret.messages?.push('Contains suspicious words\n');
            ret.result = 'FAIL';
        }
        if (ret.result === 'PASS') {
            ret.messages?.push('No Issue found with Subject\n');
        }
        return ret;
    };

    /* same as analyzeSubject but for body */
    public analyzeBody = (email: Email): Analysis => {
        let ret: Analysis = {
            messages: [''],
            result: 'PASS',
        };
        if ((email.body.match(/http/g) || []).length > 3) {
            ret.messages.push('Multiple links in body\n');
            ret.result = 'FAIL';
        }
        if (this.sus_words.some((word) => email.body.toLowerCase().includes(word))) {
            ret.messages.push('Contains suspicious words\n');
            ret.result = 'FAIL';
        }
        if (/\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/.test(email.body)) {
            ret.messages.push('Potential credit card number\n');
            ret.result = 'FAIL';
        }

        if (ret.result === 'PASS') {
            ret.messages?.push('No Issue found with email body\n');
        }
        return ret;
    };

    /* use GEMINI AI to check the email and render md output to terminal */
    public useAi = async (email: Email): Promise<void> => {
        if (email === null || email?.body === null || email?.subject === null) {
            return null;
        }

        const query: string = `Analyze this email for me , i want to know if it is a scam or spam\n` + `subject : ${email?.subject}\n` + `body: ${email?.body}`;

        /* show the loading screen */
        const loader = loadingAnimation('Loading...');

        setTimeout(() => {
            clearInterval(loader);
        }, 1000);

        // result comes in the form of a markdown
        const result: string = await run(query);

        /* rendering markdown */
        marked.use(markedTerminal());
        console.log(marked.parse(result));

        return null;
    };
}

// mock email
const fetch_email = (): Email => {
    const e: Email = {
        sender: 'support+news@mail.anthropic.com',
        subject: 'Projects—now available for Pro and Team users',
        body: `Hey buy our new course for free, cashapp require send it to CASHAPP: 09As92jsx visit our link` + `http://hacks.io to register`,
    };
    return e;
};

const main = () => {
    const E = new EmailAnalyzer(null, null);
    const e: Email = fetch_email();

    const args = parseArgs({
        options: {
            help: {
                type: 'boolean',
                short: 'h',
            },
            AI: {
                type: 'boolean',
                short: 'a',
                default: false,
            },
            noAI: {
                type: 'boolean',
                short: 'n',
                default: true,
            },
            body: {
                type: 'string',
                short: 'b',
                default: '',
            },
            sender: {
                type: 'string',
                short: 's',
                default: '',
            },
            Subject: {
                type: 'string',
                short: 'S',
                default: '',
            },
            demo: {
                type: 'boolean',
                short: 'd',
                default: false,
            },
        },
    });

    if (args.values.help) {
        console.log(
            'email Verification --\n' +
                '--help  -h\tprint help message\n' +
                '--noAI -n\tuse no AI (default)\n' +
                '--AI -a\tuse AI\n' +
                "--body -b\temail's body (required)\n" +
                "--sender -s\tsender's email (required)\n" +
                '--Subject -b\temail Subject (required)\n',
            '--demo -d\tUse app demo\n',
        );
        exit(0);
    }
    if (!args.values.demo) {
        if (args.values.body === '' || args.values.sender === '' || args.values.Subject === '') {
            console.warn('no body passed!\n');
            exit(1);
        }
    }
    if (args.values.body) {
        e.body = args.values.body.toString();
    }
    if (args.values.sender) {
        e.sender = args.values.sender.toString();
    }
    if (args.values.Subject) {
        e.subject = args.values.Subject.toString();
    }

    // uses no Ai first ( checks for AI first because by default it is false until triggered)
    if (args.values.AI) {
        E.useAi(e);
    } else if (args.values.noAI) {
        E.analyzeEmail(e);
    }
};

main();
