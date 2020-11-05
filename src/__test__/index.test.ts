import merge from 'lodash.merge'
import ServerlessOfflineSSM from '../index'
import { getValueFromEnv } from '../util'

jest.mock('../util')

describe('serverless-offline-ssm', () => {
  const resolver = jest.fn()
  const stage = '__STAGE__'
  const mockGetValueFromEnv = getValueFromEnv as jest.Mock

  beforeEach(() => {
    mockGetValueFromEnv.mockClear()
  })

  const serverlessMock = (options: any = {}) => merge({
    cli: {
      log: jest.fn(),
    },
    service: {
      custom: {
        'serverless-offline-ssm': {
          stages: [stage]
        },
      },
      provider: {},
    },
    variables: {
      variableResolvers: [
        {
          regex: RegExp(/(ssm):(.*)/),
          serviceName: 'SSM',
          resolver,
        },
      ],
    },
    version: '1.69.0',
  }, options)

  const serverlessOptionsMock = (options: any = {}) => merge({
    stage,
  }, options)

  test('should initialize with a valid options stage', () => {
    const serverless = serverlessMock()
    const options = serverlessOptionsMock()
    const instance = new ServerlessOfflineSSM(serverless, options)

    // check the resolver has been overridden
    expect(serverless.variables.variableResolvers[0].resolver).toEqual(instance.resolver)
  })

  test('should initialize with a valid provider stage', () => {
    const serverless = serverlessMock({
      service: {
        provider: {
          stage,
        }
      }
    })
    const options = serverlessOptionsMock({ stage: null })
    const instance = new ServerlessOfflineSSM(serverless, options)

    // check the resolver has been overridden
    expect(serverless.variables.variableResolvers[0].resolver).toEqual(instance.resolver)
  })

  test('should not initialize without a valid stage', () => {
    const serverless = serverlessMock()
    const options = serverlessOptionsMock({ stage: null })
    const instance = new ServerlessOfflineSSM(serverless, options)

    // check the resolver has "not" been overridden
    expect(serverless.variables.variableResolvers[0].resolver).not.toEqual(instance.resolver)
  })

  test('should initialize with ssmOfflineStages passed to the CLI', () => {
    const serverless = serverlessMock({
      service: {
        custom: {
          'serverless-offline-ssm': {
            stages: null,
          },
        },
      },
    })
    const options = serverlessOptionsMock({ ssmOfflineStages: stage })
    const instance = new ServerlessOfflineSSM(serverless, options)

    // check the resolver has been overridden
    expect(serverless.variables.variableResolvers[0].resolver).toEqual(instance.resolver)
  })

  test('throws an exception with an invalid serverless version', () => {
    expect(() => new ServerlessOfflineSSM(
      serverlessMock({ version: '0.99'}),
      serverlessOptionsMock(),
    )).toThrowError(
      'serverless-offline-ssm plugin only works with Serverless 1.69 upwards.'
    )

    expect(() => new ServerlessOfflineSSM(
      serverlessMock({ version: '1.68'}),
      serverlessOptionsMock(),
    )).toThrowError(
      'serverless-offline-ssm plugin only works with Serverless 1.69 upwards.'
    )
  })

  test('throws an exception when the configuration is invalid', () => {
    expect(() => new ServerlessOfflineSSM(
      serverlessMock({
        service: {
          custom: {
            'serverless-offline-ssm': {
              stages: null,
            },
          },
        },
      }),
      serverlessOptionsMock(),
    )).toThrowError(
      'serverless-offline-ssm missing configuration stages.'
    )
  })

  describe('resolver', () => {
    const yaml = '__YAML_VALUE__'
    const both = '__BOTH_YAML_VALUE__'
    const env = '__ENV_VALUE__'

    const instance = new ServerlessOfflineSSM(
      serverlessMock({
        service: {
          custom: {
            'serverless-offline-ssm': {
              stages: [stage],
              ssm: {
                yaml,
                both,
              },
            },
          },
        },
      }),
      serverlessOptionsMock(),
    )

    test('resolves with an undefined value with an invalid key', async () => {
      await expect(instance.resolver('invalid')).resolves.toBeUndefined()
    })

    test('resolves with the value defined within the serverless config', async () => {
      await expect(instance.resolver('ssm:yaml')).resolves.toEqual(yaml)
    })

    test('resolves with the value defined within the .env file', async () => {
      mockGetValueFromEnv.mockResolvedValueOnce(env)

      await expect(instance.resolver('ssm:env')).resolves.toEqual(env)

      expect(mockGetValueFromEnv).toHaveBeenCalledWith('env')
    })

    test('resolves values from the serverless config in preference to the .env file', async () => {
      mockGetValueFromEnv.mockResolvedValueOnce('__BOTH_ENV_VALUE__')

      await expect(instance.resolver('ssm:both')).resolves.toEqual(both)

      expect(mockGetValueFromEnv).not.toHaveBeenCalled()
    })
  })

  describe('resolver with AWS Secrets Manager key', () => {
    const yaml = '__YAML_VALUE__'

    const instance = new ServerlessOfflineSSM(
      serverlessMock({
        service: {
          custom: {
            'serverless-offline-ssm': {
              stages: [stage],
              ssm: {
                yaml,
                '/aws/reference/secretsmanager/__PARSABLE_KEY__': '{ "__KEY__": "__VALUE__" }',
                '/aws/reference/secretsmanager/__UNPARSABLE_KEY__': '__UNPARSABLE_VALUE__'
              },
            },
          },
        },
      }),
      serverlessOptionsMock(),
    )

    test('resolves with the value for regular key', async () => {
      await expect(instance.resolver('ssm:yaml')).resolves.toEqual(yaml)
    })

    test('resolves with the value parsed as JSON for AWS Secret Manager keys', async () => {
      await expect(instance.resolver('ssm:/aws/reference/secretsmanager/__PARSABLE_KEY__')).resolves.toEqual({ "__KEY__": "__VALUE__" })
    })

    test('resolves with the value unparsed if the value is unparsable for AWS Secret Manager keys', async () => {
      await expect(instance.resolver('ssm:/aws/reference/secretsmanager/__UNPARSABLE_KEY__')).resolves.toEqual('__UNPARSABLE_VALUE__')
    })

  })
})

