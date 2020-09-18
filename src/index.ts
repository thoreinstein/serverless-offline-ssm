import Serverless from 'serverless'
import Plugin from 'serverless/classes/Plugin'
import { getValueFromEnv } from './util'

type ServerlessOfflineSSMConfig = {
  stages: string[]
  ssm?: Record<string, string>
}

type Resolver = {
  regex: RegExp
  resolver: (name: string) => Promise<string | void>
  isDisabledAtPrepopulation?: boolean
  serviceName?: string
}

type ServerlessOffline = Serverless & {
  variables: {
    variableResolvers: Resolver[]
  }
}

class ServerlessOfflineSSM implements Plugin {
  private log: (message: string) => null
  private config?: ServerlessOfflineSSMConfig
  private provider: string
  private ssmResolver: Resolver | null

  hooks: Plugin.Hooks;
  commands?: Plugin.Commands;

  constructor(
    private serverless: ServerlessOffline,
    private options: Serverless.Options
  ) {
    this.log = serverless.cli.log.bind(serverless.cli)
    this.config = serverless.service.custom?.['serverless-offline-ssm'] ?? {}
    this.provider = 'aws'

    // check for valid configuration
    this.valid()

    // check whether this plugin should be executed
    if (this.shouldExecute()) {
      // check for compatibility
      this.compatible()

      this.ssmResolver = serverless.variables.variableResolvers
        .find(({ serviceName }) => serviceName === 'SSM')

      // override the resolver
      if (this.ssmResolver) {
        this.ssmResolver.resolver = this.resolver
      }
    }
  }

  public resolver = (name: string): Promise<string | void> => {
    const [,, key] = name.match(this.ssmResolver.regex) || []

    if (!key) {
      // Yields "A valid SSM parameter ... could not be found."
      return Promise.resolve()
    }

    const value = this.config.ssm?.[key]
    const promisifiedValue = value
      ? Promise.resolve(value)
      : getValueFromEnv(key)
    
    if (key.startsWith('/aws/reference/secretsmanager')) {
      return promisifiedValue.then(JSON.parse).catch(() => promisifiedValue)
    } 

    return promisifiedValue
  }

  shouldExecute = (): boolean => {
    return this.config.stages.includes(
      this.options.stage || this.serverless.service.provider?.stage
    ) ?? false
  }

  /**
   * This plugin is only compatible with serverless 1.69+
   */
  private compatible = () => {
    const { version } = this.serverless

    this.log(
      `serverless-offline-ssm checking serverless version ${version}.`,
    )

    const [major, minor] = version.split('.').map(Number)

    if (major < 1 || (major === 1 && minor < 69)) {
      throw new Error(
        'serverless-offline-ssm plugin only works with Serverless 1.69 upwards.',
      )
    }
  }

  private valid = () => {
    if (!this.config.stages) {
      throw new Error('serverless-offline-ssm missing configuration stages.',)
    }
  }
}

export = ServerlessOfflineSSM
