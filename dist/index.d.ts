import Serverless from 'serverless';
import Plugin from 'serverless/classes/Plugin';
declare type Resolver = {
    regex: RegExp;
    resolver: (name: string) => Promise<string | void>;
    isDisabledAtPrepopulation?: boolean;
    serviceName?: string;
};
declare type ServerlessOffline = Serverless & {
    variables: {
        variableResolvers: Resolver[];
    };
};
declare class ServerlessOfflineSSM implements Plugin {
    private serverless;
    private options;
    private log;
    private config?;
    private provider;
    private ssmResolver;
    hooks: Plugin.Hooks;
    commands?: Plugin.Commands;
    constructor(serverless: ServerlessOffline, options: Serverless.Options);
    resolver: (name: string) => Promise<string | void>;
    shouldExecute: () => boolean;
    /**
     * This plugin is only compatible with serverless 1.69+
     */
    private compatible;
    private valid;
}
export = ServerlessOfflineSSM;
