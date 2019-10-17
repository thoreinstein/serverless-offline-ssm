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

  constructor(serverless: Serverless) {
    this.serverless = serverless

    // only run offline plugin when offline command is passed in
    if (this.serverless.processedInput.commands.indexOf('offline') < 0) {
      return
    }

    if (!this.checkCompatibility()) {
      console.log('This version of the plugin only works with Serverless 1.52 upwards.')
      return
    }

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

  /**
   * This plugin is only compatible with serverless 1.52+
   */
  checkCompatibility(): boolean {
    const semver: number[] = this.serverless.version
      .split('.')
      .map(i => Number(i))

    if (semver[0] <= 1 && semver[1] < 52) {
      return false
    }

    return true
  }
}

export = ServerlessOfflineSSM
