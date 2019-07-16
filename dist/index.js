"use strict";
const util_1 = require("./util");
class ServerlessOfflineSSM {
    constructor(serverless) {
        this.serverless = serverless;
        this.variables = serverless.variables;
        this.ssmRefSyntax = RegExp(/^(?:\${)?ssm:([a-zA-Z0-9_.\-/]+)[~]?(true|false|split)?/);
        this.serverless.variables.getValueFromSsm = function getValueFromSsm(variable) {
            const param = variable.match(this.ssmRefSyntax)[1];
            const vars = util_1.getVarsFromEnv();
            return Promise.resolve(vars[param]);
        };
    }
}
module.exports = ServerlessOfflineSSM;
//# sourceMappingURL=index.js.map