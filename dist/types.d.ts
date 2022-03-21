import Serverless from 'serverless';
import { Resolver } from './resolver';
export declare type CustomOptions = {
    stages: string[];
    ssm?: Record<string, string>;
};
export declare type ServerlessOffline = Serverless & {
    variables: {
        variableResolvers: Resolver[];
    };
};
export declare type ServerlessOptions = Serverless.Options & {
    ssmOfflineStages?: string;
};
