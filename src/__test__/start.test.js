import start from '../start'

const serverless = {
  cli: {
    log: jest.fn(),
  },
  service: {
    provider: {
      environment: {
        STAGE: '${opt:stage, self:provider.stage}', // eslint-disable-line
        ENV_VAR: '${ssm:ENV_VAR}' // eslint-disable-line
      }
    }
  }
}

it('updates the serverless config env vars', async () => {
  await start(serverless)
  expect(serverless.service.provider.environment.ENV_VAR).toBe('FOO')
  expect(serverless.service.provider.environment.STAGE).toBe('${opt:stage, self:provider.stage}') // eslint-disable-line
})

it('runs when the environment is null', async () => {
  const serverlessNullEnv = {
    cli: {
      log: jest.fn(),
    },
    service: {
      provider: {
        environment: null
      }
    }
  }

  await start(serverlessNullEnv)
  expect(serverlessNullEnv.service.provider.environment).toBeNull()
})

it('updates the serverless config function env vars', async () => {
  const serverlessFnEnv = {
    cli: {
      log: jest.fn(),
    },
    service: {
      provider: {
        environment: {
          ENV_VAR: 'FOO'
        }
      },
      functions: {
        test1: {
          environment: {
            STAGE: '${opt:stage, self:provider.stage}', // eslint-disable-line
            ENV_VAR: '${ssm:ENV_VAR}' // eslint-disable-line
          }
        },
        test2: {
          environment: {
            STAGE: '${opt:stage, self:provider.stage}', // eslint-disable-line
            ENV_VAR: 'FOO' // eslint-disable-line
          }
        }
      }
    }
  }

  await start(serverlessFnEnv)
  expect(serverlessFnEnv.service.provider.environment.ENV_VAR).toBe('FOO')
  expect(serverlessFnEnv.service.functions.test1.environment.ENV_VAR).toBe('FOO')
  expect(serverlessFnEnv.service.functions.test1.environment.STAGE).toBe('${opt:stage, self:provider.stage}') // eslint-disable-line
  expect(serverlessFnEnv.service.functions.test2.environment.ENV_VAR).toBe('FOO')
})
