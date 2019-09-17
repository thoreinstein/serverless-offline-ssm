declare type Config = {
    [key: string]: string;
};
declare type Serverless = {
    variables: Variables;
    service: {
        custom: {
            'serverless-offline-ssm'?: Config;
        };
    };
};
declare type Variables = {
    getValueFromSsm: (variable: string) => any;
};
declare class ServerlessOfflineSSM {
    serverless: Serverless;
    variables: Variables;
    ssmRefSyntax: RegExp;
    constructor(serverless: Serverless);
    getConfigFromServerlessYml(): Config;
}
export = ServerlessOfflineSSM;
