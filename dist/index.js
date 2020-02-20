"use strict";
const util_1 = require("./util");
class ServerlessOfflineSSM {
    constructor(serverless) {
        this.serverless = serverless;
        if (!this.shouldRunPlugin()) {
            console.log('The plugin "serverless-offline-ssm" only runs when offline.');
            return;
        }
        if (!this.isCompatibile()) {
            console.log('This version of the plugin only works with Serverless 1.52 upwards.');
            return;
        }
        const serverlessVars = this.serverless.variables;
        const customConfig = this.getConfigFromServerlessYml();
        const createLocalParser = function (expr) {
            return function (variable) {
                const param = variable.match(expr)[1];
                const vars = Object.keys(customConfig).length === 0 ? util_1.getVarsFromEnv() : customConfig;
                return Promise.resolve(vars[param]);
            };
        };
        serverlessVars.getValueFromSsmOffline = createLocalParser(serverlessVars.ssmRefSyntax);
        serverlessVars.getValueFromCloudFormationOffline = createLocalParser(serverlessVars.cfRefSyntax);
        // override the ssm resolver function
        for (const varResolver of serverlessVars.variableResolvers) {
            if (varResolver.serviceName === 'SSM') {
                varResolver.resolver = serverlessVars.getValueFromSsmOffline.bind(this);
            }
            if (varResolver.serviceName === "CloudFormation") {
                varResolver.resolver = serverlessVars.getValueFromCloudFormationOffline.bind(this);
            }
        }
    }
    shouldRunPlugin() {
        const { commands } = this.serverless.processedInput;
        if (commands.includes('offline')) {
            return true;
        }
        if (commands[0] === 'invoke' && commands[1] === 'local') {
            return true;
        }
        if (commands[0] === 'print') {
            return true;
        }
        return false;
    }
    getConfigFromServerlessYml() {
        return ((this.serverless.service.custom || {})['serverless-offline-ssm'] || {});
    }
    /**
     * This plugin is only compatible with serverless 1.52+
     */
    isCompatibile() {
        const [major, minor] = this.serverless.version
            .split('.')
            .map(i => Number(i));
        if (major <= 1 && minor < 52) {
            return false;
        }
        return true;
    }
}
module.exports = ServerlessOfflineSSM;
//# sourceMappingURL=index.js.map