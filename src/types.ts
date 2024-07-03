export type CHECK = 'PASS' | 'FAIL';
export type RISK_LEVEL = 'LOW' | 'MID' | 'HIGH';

export interface Analysis {
    messages?: string[];
    result: CHECK;
}

export interface Email {
    body?: string;
    subject?: string;
    sender: string;
}

export interface Results {
    spellingErrors?: number;
    senderVerification?: boolean;
    subjectAnalysis?: Analysis;
    bodyAnalysis?: Analysis;
    overallRisk?: RISK_LEVEL;
}

export interface IpsEmailResponse {
    message: string;
    valid: boolean;
    smtp_score: number;
    overall_score: number;
    common: boolean;
    honeypot: boolean;
    dns_valid: boolean;
    catch_all: boolean;
    timed_out: boolean;
    suspect: boolean;
    recent_abuse: boolean;
    fraud_score: number;
    leaked: boolean;
}
