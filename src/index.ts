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

    const serverlessVars = this.serverless.variables
    const customConfig = this.getConfigFromServerlessYml();

    serverlessVars.getValueFromSsmOffline = (variable) => {
      const param = variable.match(serverlessVars.ssmRefSyntax)[1];
      const vars = Object.keys(customConfig).length === 0
        ? getVarsFromEnv()
        : customConfig

      return Promise.resolve(vars[param])
    }

    // override the ssm resolver function
    for (const varResolver of serverlessVars.variableResolvers) {
      if (varResolver.serviceName === 'SSM') {
        varResolver.resolver = serverlessVars.getValueFromSsmOffline.bind(this)
      }
    }
  }

  getConfigFromServerlessYml(): Config {
    return (this.serverless.service.custom || {})['serverless-offline-ssm'] || {}
  }
}

export = ServerlessOfflineSSM
