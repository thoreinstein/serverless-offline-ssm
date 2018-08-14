import { Promise } from 'bluebird'
import readEnvFile from './envFile'
import checkParam from './checkParam'

export default serverless => new Promise(resolve => {
    const lines = readEnvFile()
    const sv = serverless
    const { environment } = serverless.service.provider

    Object.keys(environment || {}).forEach(key => {
      if (checkParam(environment[key])) {

        lines.forEach(line => {
          const [envKey, value] = line.split(/=(.*)/)

          if (envKey === key) {
            serverless.cli.log(`Setting Variable ${key} to ${value}`)

            environment[key] = value
          }
        })
      }
    })
    sv.service.provider.environment = environment

    return resolve()
})
