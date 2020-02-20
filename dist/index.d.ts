declare type Config = {
    [key: string]: string;
};
declare type Serverless = {
    variables: Variables;
    version: string;
    service: {
        custom: {
            'serverless-offline-ssm'?: Config;
        };
    };
    processedInput: {
        commands: string[];
    };
};
declare type VariableResolvers = {
    regex: RegExp;
    resolver: (variable: string) => any;
    serviceName?: string;
    isDisabledAtPrepopulation?: boolean;
};
declare type Variables = {
    ssmRefSyntax: RegExp;
    getValueFromSsm: (variable: string) => any;
    getValueFromSsmOffline: (variable: string) => any | undefined;
    cfRefSyntax: RegExp;
    getValueFromCloudFormationOffline: (variable: string) => any | undefined;
    variableResolvers: VariableResolvers[];
};
declare class ServerlessOfflineSSM {
    serverless: Serverless;
    constructor(serverless: Serverless);
    shouldRunPlugin(): boolean;
    getConfigFromServerlessYml(): Config;
    /**
     * This plugin is only compatible with serverless 1.52+
     */
    isCompatibile(): boolean;
}
export = ServerlessOfflineSSM;
