import { getVarsFromEnv } from './util'

type Config = {
  [key: string]: string;
}

type Serverless = {
  variables: Variables
  version: string
  service: {
    custom: {
      'serverless-offline-ssm'?: Config
    }
  },
  processedInput: {
    commands: string[]
  }
}

type VariableResolvers = {
  regex: RegExp
  resolver: (variable: string) => any
  serviceName?: string
  isDisabledAtPrepopulation?: boolean
}

type Variables = {
  ssmRefSyntax: RegExp
  getValueFromSsm: (variable: string) => any
  getValueFromSsmOffline: (variable: string) => any | undefined
  variableResolvers: VariableResolvers[]
}

class ServerlessOfflineSSM {
  serverless: Serverless
  variables: Variables
  ssmRefSyntax: RegExp

  constructor(serverless: Serverless) {
    this.serverless = serverless

    // only run offline plugin when offline command is passed in
    if (this.serverless.processedInput.commands.indexOf('offline') < 0) {
      return;
    }

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
