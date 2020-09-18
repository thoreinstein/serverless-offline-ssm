"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValueFromEnv = void 0;
const fs_1 = require("fs");
exports.getValueFromEnv = (key) => new Promise((resolve, reject) => {
    if (!fs_1.existsSync('.env')) {
        resolve();
        return;
    }
    fs_1.readFile('.env', { encoding: 'utf-8' }, (err, data) => {
        if (err) {
            reject(err);
            return;
        }
        const values = data
            .trim()
            .split('\n')
            .map(line => line.split(/=(.*)/))
            .reduce((accumulation, [key, value]) => (Object.assign(Object.assign({}, accumulation), { [key]: value })), {});
        resolve(values[key]);
    });
});
//# sourceMappingURL=util.js.map