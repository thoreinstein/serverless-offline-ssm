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
