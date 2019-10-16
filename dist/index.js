"use strict";
const util_1 = require("./util");
class ServerlessOfflineSSM {
    constructor(serverless) {
        this.serverless = serverless;
        // only run offline plugin when offline command is passed in
        if (this.serverless.processedInput.commands.indexOf('offline') < 0) {
            return;
        }
        if (!this.checkCompatibility()) {
            console.log('This version of the plugin only works with Serverless 1.52 upwards.');
            return;
        }
        const serverlessVars = this.serverless.variables;
        const customConfig = this.getConfigFromServerlessYml();
        serverlessVars.getValueFromSsmOffline = (variable) => {
            const param = variable.match(serverlessVars.ssmRefSyntax)[1];
            const vars = Object.keys(customConfig).length === 0
                ? util_1.getVarsFromEnv()
                : customConfig;
            return Promise.resolve(vars[param]);
        };
        // override the ssm resolver function
        for (const varResolver of serverlessVars.variableResolvers) {
            if (varResolver.serviceName === 'SSM') {
                varResolver.resolver = serverlessVars.getValueFromSsmOffline.bind(this);
            }
        }
    }
    getConfigFromServerlessYml() {
        return (this.serverless.service.custom || {})['serverless-offline-ssm'] || {};
    }
    /**
     * This plugin is only compatible with serverless 1.52+
     */
    checkCompatibility() {
        const semver = this.serverless.version
            .split('.')
            .map(i => Number(i));
        if (semver[0] <= 1 && semver[1] < 52) {
            return false;
        }
        return true;
    }
}
module.exports = ServerlessOfflineSSM;
//# sourceMappingURL=index.js.map