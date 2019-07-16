declare type Serverless = {
    variables: Variables;
};
declare type Variables = {
    getValueFromSsm: (variable: string) => any;
};
declare class ServerlessOfflineSSM {
    serverless: Serverless;
    variables: Variables;
    ssmRefSyntax: RegExp;
    constructor(serverless: Serverless);
}
export = ServerlessOfflineSSM;
