const ServerlessOfflineSSM = require('../index')

jest.mock('../util', () => ({
  getVarsFromEnv: jest.fn().mockReturnValue({
    test: 'some value',
  }),
}))

describe('serverless-offline-ssm', () => {
  const serverlessMock = () => ({
    version: '1.52.0',
    processedInput: { commands: ['offline'] },
    service: {
      custom: {},
    },
    variables: {
      ssmRefSyntax: RegExp(/(test)/),
      variableResolvers: [
        {
          serviceName: 'SSM',
        },
      ],
    },
  })

  describe('offline', () => {
    test('should initialize when using serverless offline', () => {
      const instance = new ServerlessOfflineSSM(serverlessMock())
      expect(instance.serverless.variables.getValueFromSsmOffline).toBeDefined()
      expect(
        instance.serverless.variables.variableResolvers[0].resolver,
      ).toBeDefined()
    })

    test('should initialize when using invoke local', () => {
      const instance = new ServerlessOfflineSSM({
        ...serverlessMock(),
        processedInput: { commands: ['invoke', 'local'] },
      })
      expect(instance.serverless.variables.getValueFromSsmOffline).toBeDefined()
      expect(
        instance.serverless.variables.variableResolvers[0].resolver,
      ).toBeDefined()
    })

    test('should skip initialization when not offline', () => {
      const instance = new ServerlessOfflineSSM({
        ...serverlessMock(),
        processedInput: { commands: ['deploy'] },
      })
      expect(
        instance.serverless.variables.getValueFromSsmOffline,
      ).toBeUndefined()
      expect(
        instance.serverless.variables.variableResolvers[0].resolver,
      ).toBeUndefined()
    })
  })

  describe('checkCompatibility', () => {
    test('should return false if version is less than 1.52.0', () => {
      const instance = new ServerlessOfflineSSM({
        ...serverlessMock(),
        version: '1.51.0',
      })
      expect(instance.isCompatibile()).toBeFalsy()
    })

    test('should return true if version is 1.52.0 or higher', () => {
      const instance = new ServerlessOfflineSSM(serverlessMock())
      expect(instance.isCompatibile()).toBeTruthy()
    })

    test('should return true for version 2.0.0 or higher', () => {
      const instance = new ServerlessOfflineSSM({
        ...serverlessMock(),
        version: '2.0.0',
      })
      expect(instance.isCompatibile()).toBeTruthy()
    })
  })

  describe('custom config variable loading', () => {
    test('should load ssm variables under the serverless-offline-ssm section', async () => {
      const mockServerlessInstance = {
        ...serverlessMock(),
      }

      mockServerlessInstance.service.custom = {
        'serverless-offline-ssm': {
          test: 'some value',
        },
      }

      const instance = new ServerlessOfflineSSM(mockServerlessInstance)
      await expect(
        instance.serverless.variables.getValueFromSsmOffline('test'),
      ).resolves.toBe('some value')
    })
  })

  describe('.env file variable loading', () => {
    test('should load ssm variables from .env file ', async () => {
      const instance = new ServerlessOfflineSSM(serverlessMock())
      await expect(
        instance.serverless.variables.getValueFromSsmOffline('test'),
      ).resolves.toBe('some value')
    })
  })
})
