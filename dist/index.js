

const fs = require('fs');
const bluebird = require('bluebird');

const readEnvFile = (path = '.env') => fs.readFileSync(path, { encoding: 'utf-8' }).trim().split('\n')

const checkParam = (envValue) => {
  if (envValue === undefined || envValue.startsWith('${ssm:')) {
    return true;
  }

  return false
}

const start = serverless => new bluebird.Promise(resolve => {
    const lines = readEnvFile();
    const sv = serverless;
    const { environment } = serverless.service.provider;

    Object.keys(environment).forEach(key => {
      if (checkParam(environment[key])) {

        lines.forEach(line => {
          const [envKey, value] = line.split('=');

          if (envKey === key) {
            serverless.cli.log(`Setting Variable ${key} to ${value}`);

            environment[key] = value;
          }
        });
      }
    });
    sv.service.provider.environment = environment;

    return resolve()
})

class ServerlessOfflineSSM {
  constructor(serverless) {
    this.serverless = serverless;

    this.hooks = {
      'before:run:run': start.bind(null, serverless),
      'before:offline:start': start.bind(null, serverless),
      'before:offline:start:init': start.bind(null, serverless),
      'before:invoke:local:invoke': start.bind(null, serverless),
    };
  }
}

module.exports = ServerlessOfflineSSM;
