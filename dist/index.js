"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const resolver_1 = __importDefault(require("./resolver"));
const util_1 = require("./util");
class ServerlessOfflineSSM {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options;
        /**
         * This plugin is only compatible with serverless 1.69+
         */
        this.checkCompatible = () => {
            const { version } = this.serverless;
            this.log(`serverless-offline-ssm checking serverless version ${version}.`);
            const [major, minor] = util_1.getMajorAndMinorVersion(version);
            if (major < 1 || (major === 1 && minor < 69)) {
                throw new Error('serverless-offline-ssm plugin only works with Serverless 1.69 upwards.');
            }
        };
        this.setCustomConfig = () => {
            var _a, _b;
            const config = (_b = (_a = this.serverless.service.custom) === null || _a === void 0 ? void 0 : _a['serverless-offline-ssm']) !== null && _b !== void 0 ? _b : {};
            if (!!this.options.ssmOfflineStages) {
                config.stages = this.options.ssmOfflineStages.split(',');
            }
            if (!config.stages) {
                throw new Error('serverless-offline-ssm missing configuration stages.');
            }
            this.customOptions = config;
        };
        this.log = serverless.cli.log.bind(serverless.cli);
        this.setCustomConfig();
        this.checkCompatible();
        if (this.shouldExecute()) {
            this.applyResolver();
        }
    }
    applyResolver() {
        const [major, _] = util_1.getMajorAndMinorVersion(this.serverless.version);
        const resolver = new resolver_1.default(this.serverless, this.options, this.customOptions);
        resolver.apply(major);
    }
    shouldExecute() {
        var _a, _b;
        return (_b = this.customOptions.stages.includes(this.options.stage || ((_a = this.serverless.service.provider) === null || _a === void 0 ? void 0 : _a.stage))) !== null && _b !== void 0 ? _b : false;
    }
}
module.exports = ServerlessOfflineSSM;
//# sourceMappingURL=index.js.map