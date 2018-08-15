import { Promise } from 'bluebird'
import readEnvFile from './envFile'
import checkParam from './checkParam'

const updateEnvironment = (provider, lines, serverless, debugName) => {
  const { environment } = provider

  Object.keys(environment || {}).forEach(key => {
    if (checkParam(environment[key])) {

      lines.forEach(line => {
        const [envKey, value] = line.split(/=(.*)/)

        if (envKey === key) {
          serverless.cli.log(`Setting '${debugName}' Variable ${key} to ${value}`)

          environment[key] = value
        }
      })
    }
  })

  const updatedProvider = provider
  updatedProvider.environment = environment
  return updatedProvider
}

export default serverless => new Promise(resolve => {
    const lines = readEnvFile()
    const sv = serverless

    sv.service.provider = updateEnvironment(sv.service.provider, lines, sv, `Service`)
    Object.keys(sv.service.functions || []).forEach(functionName => {
      const functionFields = sv.service.functions[functionName]
      sv.service.functions[functionName] = updateEnvironment(functionFields, lines, sv, `Function ${functionName}`)
    })

    return resolve()
})
