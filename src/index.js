import start from './start'

export default class ServerlessOfflineSSM {
  constructor(serverless) {
    this.serverless = serverless

    this.hooks = {
      'before:run:run': start.bind(null, serverless),
      'before:offline:start': start.bind(null, serverless),
      'before:offline:start:init': start.bind(null, serverless),
      'before:invoke:local:invoke': start.bind(null, serverless),
    }
  }
}
