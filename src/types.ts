import Serverless from 'serverless'
import { Resolver } from './resolver'


export type CustomOptions = {
  stages: string[]
  ssm?: Record<string, string>
  ssmPrefix?: string
}

export type ServerlessOffline = Serverless & {
  variables: {
    variableResolvers: Resolver[]
  }
}

export type ServerlessOptions = Serverless.Options & {
  ssmOfflineStages?: string
}