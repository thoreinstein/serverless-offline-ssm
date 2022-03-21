import { ServerlessOptions, ServerlessOffline, CustomOptions } from './types';
declare type AWSParams = {
    Name: string;
    WithDecryption?: boolean;
};
export declare type Resolver = {
    regex: RegExp;
    resolver: (name: string) => Promise<string | void>;
    serviceName?: string;
};
export declare type ResolverV2 = {
    regex: RegExp;
    resolver: (name: string) => Promise<string | void>;
    serviceName?: string;
};
declare type AWSRequest = (service: string, method: string, params: AWSParams, options: ServerlessOptions) => Promise<unknown>;
export default class ResolverHandler {
    private serverless;
    private options;
    private customOptions;
    constructor(serverless: ServerlessOffline, options: ServerlessOptions, customOptions: CustomOptions);
    getValue(key: string): Promise<string>;
    apply(major: number): void;
    applyV3(): void;
    V3(ssmRequest: AWSRequest): AWSRequest;
    applyV2(): void;
    V2(ssmResolver: Resolver): (name: string) => Promise<string | void>;
}
export {};
