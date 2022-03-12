import ServerlessOfflineSSM from '../index'
import { serverlessMock, serverlessOptionsMock } from './mocks/serverless'

const stage = '__STAGE__'

describe('serverless-offline-ssm', () => {
  
  test('should call shouldExecute', () => {
    const spyShouldExecute = jest.spyOn(ServerlessOfflineSSM.prototype, 'shouldExecute')

    const serverless = serverlessMock()
    const options = serverlessOptionsMock()
    new ServerlessOfflineSSM(serverless, options)

    expect(spyShouldExecute).toBeCalledTimes(1)
  })

  test('should execute with a valid provider stage', () => {
    const serverless = serverlessMock({
      service: {
        provider: {
          stage,
        }
      }
    })
    const options = serverlessOptionsMock({ stage: null })
    const instance = new ServerlessOfflineSSM(serverless, options)

    expect(instance.shouldExecute()).toBe(true)
  })

  test('should not execute without a valid stage', () => {
    const serverless = serverlessMock()
    const options = serverlessOptionsMock({ stage: null })
    const instance = new ServerlessOfflineSSM(serverless, options)

    expect(instance.shouldExecute()).toBe(false)
  })

  test('should execute with ssmOfflineStages passed to the CLI', () => {
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
    expect(instance.shouldExecute()).toEqual(true)
  })

  test.each(['0.99', '1.68'])
    ('throws an exception with an invalid serverless %s', (version) => {
    expect(() => new ServerlessOfflineSSM(
      serverlessMock({ version }),
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
  test('should call applyResolver', () => {
    const spyApplyResolver = jest.spyOn(ServerlessOfflineSSM.prototype, 'applyResolver')

    const serverless = serverlessMock()
    const options = serverlessOptionsMock()
    new ServerlessOfflineSSM(serverless, options)

    expect(spyApplyResolver).toBeCalledTimes(1)
  })
})

