import { getVarsFromEnv } from './util'

type Serverless = {
  variables: Variables
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

    this.serverless.variables.getValueFromSsm = function getValueFromSsm(
      variable: string,
    ): Promise<any> {
      const param = variable.match(this.ssmRefSyntax)[0]
      const vars = getVarsFromEnv()

      return Promise.resolve(vars[param])
    }
  }
}

export = ServerlessOfflineSSM
