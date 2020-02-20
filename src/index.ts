import { getVarsFromEnv } from './util'

type Config = {
  [key: string]: string
}

type Serverless = {
  variables: Variables
  version: string
  service: {
    custom: {
      'serverless-offline-ssm'?: Config
    }
  }
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
  cfRefSyntax: RegExp
  getValueFromCloudFormationOffline: (variable: string) => any | undefined
  variableResolvers: VariableResolvers[]
}

class ServerlessOfflineSSM {
  serverless: Serverless

  constructor(serverless: Serverless) {
    this.serverless = serverless

    if (!this.shouldRunPlugin()) {
      console.log('The plugin "serverless-offline-ssm" only runs when offline.')
      return
    }

    if (!this.isCompatibile()) {
      console.log(
        'This version of the plugin only works with Serverless 1.52 upwards.',
      )
      return
    }

    const serverlessVars = this.serverless.variables
    const customConfig = this.getConfigFromServerlessYml()

    const createLocalParser = function(expr:RegExp) {
      return function(variable:string) {
        const param = variable.match(expr)[1]
        const vars =
            Object.keys(customConfig).length === 0 ? getVarsFromEnv() : customConfig

        return Promise.resolve(vars[param])
      }
    }

    serverlessVars.getValueFromSsmOffline = createLocalParser(serverlessVars.ssmRefSyntax);
    serverlessVars.getValueFromCloudFormationOffline = createLocalParser(serverlessVars.cfRefSyntax);

    // override the ssm resolver function
    for (const varResolver of serverlessVars.variableResolvers) {
      if (varResolver.serviceName === 'SSM') {
        varResolver.resolver = serverlessVars.getValueFromSsmOffline.bind(this)
      }
      if (varResolver.serviceName === "CloudFormation") {
        varResolver.resolver = serverlessVars.getValueFromCloudFormationOffline.bind(this)
      }
    }
  }

  shouldRunPlugin(): boolean {
    const { commands } = this.serverless.processedInput

    if (commands.includes('offline')) {
      return true
    }

    if (commands[0] === 'invoke' && commands[1] === 'local') {
      return true
    }

    if (commands[0] === 'print') {
      return true
    }

    return false
  }

  getConfigFromServerlessYml(): Config {
    return (
      (this.serverless.service.custom || {})['serverless-offline-ssm'] || {}
    )
  }

  /**
   * This plugin is only compatible with serverless 1.52+
   */
  isCompatibile(): boolean {
    const [major, minor]: number[] = this.serverless.version
      .split('.')
      .map(i => Number(i))

    if (major <= 1 && minor < 52) {
      return false
    }

    return true
  }
}

export = ServerlessOfflineSSM
