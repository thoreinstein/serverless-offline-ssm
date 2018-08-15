

const fs = require('fs');
const bluebird = require('bluebird');

const readEnvFile = (path = '.env') => fs.readFileSync(path, { encoding: 'utf-8' }).trim().split('\n')

const checkParam = (envValue) => {
  if (envValue === undefined || (typeof envValue === 'string' &&  envValue.startsWith('${ssm:'))) {
    return true;
  }

  return false
}

const updateEnvironment = (provider, lines, serverless, debugName) => {
  const { environment } = provider;

  Object.keys(environment || {}).forEach(key => {
    if (checkParam(environment[key])) {

      lines.forEach(line => {
        const [envKey, value] = line.split(/=(.*)/);

        if (envKey === key) {
          serverless.cli.log(`Setting '${debugName}' Variable ${key} to ${value}`);

          environment[key] = value;
        }
      });
    }
  });

  const updatedProvider = provider;
  updatedProvider.environment = environment;
  return updatedProvider
};

const start = serverless => new bluebird.Promise(resolve => {
    const lines = readEnvFile();
    const sv = serverless;

    sv.service.provider = updateEnvironment(sv.service.provider, lines, sv, `Service`);
    Object.keys(sv.service.functions || []).forEach(functionName => {
      const functionFields = sv.service.functions[functionName];
      sv.service.functions[functionName] = updateEnvironment(functionFields, lines, sv, `Function ${functionName}`);
    });

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
