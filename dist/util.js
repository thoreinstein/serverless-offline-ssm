"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function getVarsFromEnv() {
    return fs_1.readFileSync('.env', { encoding: 'utf-8' })
        .trim()
        .split('\n')
        .reduce((acc, line) => {
        const [key, value] = line.split(/=(.*)/);
        acc[key] = value;
        return acc;
    }, {});
}
exports.getVarsFromEnv = getVarsFromEnv;
//# sourceMappingURL=util.js.map