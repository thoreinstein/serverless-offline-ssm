import { getVarsFromEnv } from './util'

type ConfigVariable = {

}

type Config = {
  [key: string]: string;
}

type Serverless = {
  variables: Variables
  service: {
    custom: {
      'serverless-offline-ssm'?: Config
    }
  }
}

type Variables = {
  getValueFromSsm: (variable: string) => any
}

class ServerlessOfflineSSM {
  serverless: Serverless
  variables: Variables
  ssmRefSyntax: RegExp

  constructor(serverless: Serverless) {
    this.serverless = serverless
    this.variables = serverless.variables
    this.ssmRefSyntax = RegExp(
      /^(?:\${)?ssm:([a-zA-Z0-9_.\-/]+)[~]?(true|false|split)?/,
    )

    const config = this.getConfigFromServerlessYml();

    this.serverless.variables.getValueFromSsm = function getValueFromSsm(
      variable: string,
    ): Promise<any> {
      const param = variable.match(this.ssmRefSyntax)[1]

      const vars = Object.keys(config).length === 0
        ? getVarsFromEnv()
        : config

      return Promise.resolve(vars[param])
    }
  }

  getConfigFromServerlessYml(): Config {
    return (this.serverless.service.custom || {})['serverless-offline-ssm'] || {}
  }
}

export = ServerlessOfflineSSM
