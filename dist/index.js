"use strict";
const util_1 = require("./util");
class ServerlessOfflineSSM {
    constructor(serverless) {
        this.serverless = serverless;
        // only run offline plugin when offline command is passed in
        if (this.serverless.processedInput.commands.indexOf('offline') < 0) {
            return;
        }
        this.variables = serverless.variables;
        this.ssmRefSyntax = RegExp(/^(?:\${)?ssm:([a-zA-Z0-9_.\-/]+)[~]?(true|false|split)?/);
        const config = this.getConfigFromServerlessYml();
        this.serverless.variables.getValueFromSsm = function getValueFromSsm(variable) {
            const param = variable.match(this.ssmRefSyntax)[1];
            const vars = Object.keys(config).length === 0
                ? util_1.getVarsFromEnv()
                : config;
            return Promise.resolve(vars[param]);
        };
    }
    getConfigFromServerlessYml() {
        return (this.serverless.service.custom || {})['serverless-offline-ssm'] || {};
    }
}
module.exports = ServerlessOfflineSSM;
//# sourceMappingURL=index.js.map