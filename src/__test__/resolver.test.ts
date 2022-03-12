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
    test('should call getProvider with aws', () => {
      const serverless = serverlessMock()
      const spy = jest.spyOn(serverless, 'getProvider')

      const options = serverlessOptionsMock()
      const resolver = new ResolverHandler(serverless, options, customOptions)

      resolver.applyV3()

      expect(spy).toBeCalledWith('aws')
    })
    test('should set aws.request with V3', () => {
      const serverless = serverlessMock()
      const spyGetProvider = jest.spyOn(serverless, 'getProvider')
      const provider = { request: jest.fn() } as any
      spyGetProvider.mockImplementationOnce(() => provider)

      const options = serverlessOptionsMock()
      const resolver = new ResolverHandler(serverless, options, customOptions)
      const spyResolverV3 = jest.spyOn(resolver, 'V3')

      const middleware = resolver.V3(jest.fn())

      spyResolverV3.mockImplementationOnce(() => middleware)

      resolver.applyV3()
      expect(provider.request).toBe(middleware)
    })
    test('should call setProvider with provider', () => {
      const serverless = serverlessMock()

      const provider = { request: jest.fn() } as any

      const spyGetProvider = jest.spyOn(serverless, 'getProvider')
      const spySetProvider = jest.spyOn(serverless, 'setProvider')
      spyGetProvider.mockImplementationOnce(() => provider)

      const options = serverlessOptionsMock()
      const resolver = new ResolverHandler(serverless, options, customOptions)

      resolver.applyV3()

      expect(spySetProvider).toBeCalledWith('aws', provider)
    })
    test('should call Amazon SSM if service is different then SSM', async () => {
      const resolver = new ResolverHandler(serverless, options, customOptions)
      const request = jest.fn()

      const v3 = resolver.V3(request)
      await v3('__SERVICE__', '__METHOD__', { Name: '__NAME__' }, options)

      expect(request).toHaveBeenCalled()
    })

    test('should call Amazon SSM if method is different then getParameter', async () => {
      const resolver = new ResolverHandler(serverless, options, customOptions)
      const request = jest.fn()

      const v3 = resolver.V3(request)
      await v3('SSM', '__METHOD__', { Name: '__NAME__' }, options)

      expect(request).toHaveBeenCalled()
    })

    test('should not call Amazon if service is SSM or method is different then getParameter', async () => {
      const resolver = new ResolverHandler(serverless, options, customOptions)
      const request = jest.fn()

      const v3 = resolver.V3(request)
      await v3('SSM', 'getParameter', { Name: '__NAME__' }, options)

      expect(request).not.toHaveBeenCalled()
    })

    test('should call getValue with variable', async () => {
      const resolver = new ResolverHandler(serverless, options, customOptions)
      const request = jest.fn()
      const spy = jest.spyOn(resolver, 'getValue')

      const v3 = resolver.V3(request)

      const Name = '__NAME__'

      await v3('SSM', 'getParameter', { Name }, options)

      expect(spy).toHaveBeenCalledWith(Name)
    })
    test('should return on amazon fake response', async () => {
      const resolver = new ResolverHandler(serverless, options, customOptions)
      const request = jest.fn()
      const params = { Name: '__NAME__' }
      const value = '__VALUE__'

      const spyGetValue = jest.spyOn(resolver, 'getValue')
      spyGetValue.mockImplementationOnce(async () => value)

      const v3 = resolver.V3(request)
      const response = await v3('SSM', 'getParameter', params, options)

      expect(response).toStrictEqual({
        Parameter: {
          Value: value, 
          Type: 'String',
          ...params,
        }
      })
    })
  })
 
  const getSSMResolverInstance = (serverless: ServerlessOffline) => {
    return serverless.variables.variableResolvers
    .find(({ serviceName }) => serviceName === 'SSM')
  }

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
