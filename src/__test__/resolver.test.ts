import { CustomOptions, ServerlessOffline } from ".."
import ResolverHandler from "../resolver"
import { serverlessMock, serverlessOptionsMock } from './mocks/serverless'
import * as util from '../util'

const stage = '__STAGE__'
const yaml = '__YAML_VALUE__'
const both = '__BOTH_YAML_VALUE__'
const env = '__ENV_VALUE__'

const customOptions = {
  stages: [stage],
  ssm: {
    yaml,
    both,
  },
} as CustomOptions


describe('Resolver', () => {

  const serverless = serverlessMock()
  const options = serverlessOptionsMock()
  const getSSMResolverInstance = (serverless: ServerlessOffline) => {
    return serverless.variables.variableResolvers
    .find(({ serviceName }) => serviceName === 'SSM')
  }

  describe('v3', () => {
    test.each(['3.00', '4.69', '5.99'])
      ('should call applyV3 if major version is %s', (version) => {
      
      const [major] = util.getMajorAndMinorVersion(version)
      const spy = jest.spyOn(ResolverHandler.prototype, 'applyV3')

      const serverless = serverlessMock()
      const options = serverlessOptionsMock()
      const resolver = new ResolverHandler(serverless, options, customOptions)

      resolver.apply(major)
      expect(spy).toBeCalledTimes(1)
    })
    test.todo('should call getProvider with aws')
    test.todo('should call setProvider with new resolver applied')
    test.todo('if aws.request is called with service SSM, it should call with original aws.request')
    test.todo('if aws.request is called with method getParameter, it should call with original aws.request')
    test.todo('resolves with an undefined value with an invalid key')
    test.todo('resolves with the value defined within the serverless config')
    test.todo('resolves with the value defined within the .env file')
    test.todo('resolves values from the serverless config in preference to the .env file')
  })
 
  describe('v2', () => {
    test.each(['2.00', '1.69', '1.99'])
      ('should call applyV2 if major version is %s', (version) => {
      const [major] = util.getMajorAndMinorVersion(version)
      const spy = jest.spyOn(ResolverHandler.prototype, 'applyV2')

      const resolver = new ResolverHandler(serverless, options, customOptions)

      resolver.apply(major)

      expect(spy).toBeCalledTimes(1)
    })
    test('resolves with an undefined value with an invalid key', async () => {
      const resolver = new ResolverHandler(serverless, options, customOptions)
      const v2 = resolver.V2(getSSMResolverInstance(serverless))

      await expect(v2('invalid')).resolves.toBeUndefined()
    })

    test('resolves with the value defined within the serverless config', async () => {
      const resolver = new ResolverHandler(serverless, options, customOptions)
      const v2 = resolver.V2(getSSMResolverInstance(serverless))

      await expect(v2('ssm:yaml')).resolves.toEqual(yaml)
    })

    test('resolves with the value defined within the .env file', async () => {
      const spyGetValueFromEnv = jest.spyOn(util, 'getValueFromEnv')
      spyGetValueFromEnv.mockImplementationOnce(async () => env)

      const resolver = new ResolverHandler(serverless, options, customOptions)
      const v2 = resolver.V2(getSSMResolverInstance(serverless))

      await expect(v2('ssm:env')).resolves.toEqual(env)

      expect(spyGetValueFromEnv).toHaveBeenCalledWith('env')
    })

    test('resolves values from the serverless config in preference to the .env file', async () => {
      const spyGetValueFromEnv = jest.spyOn(util, 'getValueFromEnv')
      spyGetValueFromEnv.mockImplementationOnce(async () => both)

      const resolver = new ResolverHandler(serverless, options, customOptions)
      const v2 = resolver.V2(getSSMResolverInstance(serverless))

      await expect(v2('ssm:both')).resolves.toEqual(both)
      expect(spyGetValueFromEnv).not.toHaveBeenCalled()
    })

    describe('resolver with AWS Secrets Manager key', () => {
      const customOptions = {
        stages: [stage],
        ssm: {
          yaml,
          '/aws/reference/secretsmanager/__PARSABLE_KEY__': '{ "__KEY__": "__VALUE__" }',
          '/aws/reference/secretsmanager/__UNPARSABLE_KEY__': '__UNPARSABLE_VALUE__'
        },
      } as CustomOptions

      test('resolves with the value for regular key', async () => {
        const resolver = new ResolverHandler(serverless, options, customOptions)
        const v2 = resolver.V2(getSSMResolverInstance(serverless))

        await expect(v2('ssm:yaml')).resolves.toEqual(yaml)
      })
  
      test('resolves with the value parsed as JSON for AWS Secret Manager keys', async () => {
        const resolver = new ResolverHandler(serverless, options, customOptions)
        const v2 = resolver.V2(getSSMResolverInstance(serverless))

        await expect(v2('ssm:/aws/reference/secretsmanager/__PARSABLE_KEY__')).resolves.toEqual({ "__KEY__": "__VALUE__" })
      })
  
      test('resolves with the value unparsed if the value is unparsable for AWS Secret Manager keys', async () => {
        const resolver = new ResolverHandler(serverless, options, customOptions)
        const v2 = resolver.V2(getSSMResolverInstance(serverless))

        await expect(v2('ssm:/aws/reference/secretsmanager/__UNPARSABLE_KEY__')).resolves.toEqual('__UNPARSABLE_VALUE__')
      })  
    })

  })
})
