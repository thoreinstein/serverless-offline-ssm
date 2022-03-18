"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
class ResolverHandler {
    constructor(serverless, options, customOptions) {
        this.serverless = serverless;
        this.options = options;
        this.customOptions = customOptions;
    }
    async getValue(key) {
        var _a;
        return ((_a = this.customOptions.ssm) === null || _a === void 0 ? void 0 : _a[key]) || await util_1.getValueFromEnv(key);
    }
    apply(major) {
        // can be improved
        if (major <= 2) {
            this.applyV2();
        }
        else if (major >= 3) {
            this.applyV3();
        }
    }
    applyV3() {
        const aws = this.serverless.getProvider('aws');
        if (aws) {
            const ssmRequest = aws.request.bind(aws);
            aws.request = this.V3(ssmRequest);
            this.serverless.setProvider('aws', aws);
        }
    }
    V3(ssmRequest) {
        return async (service, method, params) => {
            if (service !== 'SSM' || method !== 'getParameter') {
                return ssmRequest(service, method, params, this.options);
            }
            const name = params.Name;
            const Value = await this.getValue(name);
            return { Parameter: Object.assign({ Value, Type: 'String' }, params) };
        };
    }
    applyV2() {
        const ssmResolverInstance = this.serverless.variables.variableResolvers
            .find(({ serviceName }) => serviceName === 'SSM');
        if (ssmResolverInstance) {
            ssmResolverInstance.resolver = this.V2(ssmResolverInstance);
        }
    }
    V2(ssmResolver) {
        return async (name) => {
            const [, , key] = name.match(ssmResolver.regex) || [];
            if (!key)
                return;
            const Value = await this.getValue(key);
            if (key.startsWith('/aws/reference/secretsmanager')) {
                try {
                    return JSON.parse(Value);
                }
                catch (e) {
                    return Value;
                }
            }
            return Value;
        };
    }
}
exports.default = ResolverHandler;
//# sourceMappingURL=resolver.js.map