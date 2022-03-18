import Serverless from 'serverless';
import Plugin from 'serverless/classes/Plugin';
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
declare class ServerlessOfflineSSM implements Plugin {
    serverless: ServerlessOffline;
    options: ServerlessOptions;
    private log;
    private customOptions;
    hooks: Plugin.Hooks;
    commands?: Plugin.Commands;
    constructor(serverless: ServerlessOffline, options: ServerlessOptions);
    applyResolver(): void;
    shouldExecute(): boolean;
    /**
     * This plugin is only compatible with serverless 1.69+
     */
    private checkCompatible;
    private setCustomConfig;
}
export default ServerlessOfflineSSM;
