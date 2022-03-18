import Plugin from 'serverless/classes/Plugin'
import ResolverHandler from './resolver'
import { CustomOptions, ServerlessOffline, ServerlessOptions } from './types'
import { getMajorAndMinorVersion } from './util'


class ServerlessOfflineSSM implements Plugin {
  private log: (message: string) => null
  private customOptions: CustomOptions

  hooks: Plugin.Hooks;
  commands?: Plugin.Commands;

  constructor(
    public serverless: ServerlessOffline,
    public options: ServerlessOptions
  ) {
    this.log = serverless.cli.log.bind(serverless.cli)
    
    this.setCustomConfig() 
    this.checkCompatible()

    if (this.shouldExecute()) {
      this.applyResolver()   
    }
  }

  public applyResolver() {
    const [major, _] = getMajorAndMinorVersion(this.serverless.version)    

    const resolver = new ResolverHandler(
      this.serverless,
      this.options, 
      this.customOptions
    )
    
    resolver.apply(major)
  }

  shouldExecute(): boolean {
    return this.customOptions.stages.includes(
      this.options.stage || this.serverless.service.provider?.stage
    ) ?? false
  }

  /**
   * This plugin is only compatible with serverless 1.69+
   */
  private checkCompatible = () => {

    const { version } = this.serverless

    this.log(
      `serverless-offline-ssm checking serverless version ${version}.`,
    )

    const [major, minor]  = getMajorAndMinorVersion(version)

    if (major < 1 || (major === 1 && minor < 69)) {
      throw new Error(
        'serverless-offline-ssm plugin only works with Serverless 1.69 upwards.',
      )
    }
  }

  private setCustomConfig = (): void => {

    const config = this.serverless.service.custom?.['serverless-offline-ssm'] ?? {}

    if (!!this.options.ssmOfflineStages) {
      config.stages = this.options.ssmOfflineStages.split(',')
    }

    if (!config.stages) {
      throw new Error('serverless-offline-ssm missing configuration stages.',)
    }

    this.customOptions = config
  }
}

export = ServerlessOfflineSSM
