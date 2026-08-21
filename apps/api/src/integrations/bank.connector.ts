export type CanonicalBankTransaction={providerTransactionId:string;status:"pending"|"booked"|"reversed"|"deleted";direction:"credit"|"debit";amount:number;currency:string;description:string;narration?:string;reference?:string;sessionId?:string;counterpartyName?:string;counterpartyBank?:string;counterpartyAccountMasked?:string;transactedAt:string;bookedAt?:string;runningBalance?:number};
export type VerifiedBankEvent={eventId:string;eventType:string;occurredAt:string;transactions:CanonicalBankTransaction[];raw:Record<string,unknown>};
export interface BankConnector{readonly provider:string;verifyAndNormalize(raw:Buffer,headers:Record<string,string|undefined>,secret?:string):VerifiedBankEvent;}

