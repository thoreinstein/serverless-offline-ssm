import merge from 'lodash.merge'
import { ServerlessOffline } from '../../types'

const stage = '__STAGE__'

export const serverlessMock = (options: any = {}): ServerlessOffline => merge({
  setProvider: jest.fn(),
  getProvider: jest.fn().mockReturnValue({
    request: jest.fn()
  }),
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
        resolver: jest.fn(),
      },
    ],
  },    
  version: '1.69.0',
}, options)

export const serverlessOptionsMock = (options: any = {}) => merge({
  stage,
}, options)