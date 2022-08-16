import Serverless from 'serverless'
import { Resolver } from './resolver'


export type CustomOptions = {
  stages: string[]
  envPath?: string;
  ssm?: Record<string, string>
}

export type ServerlessOffline = Serverless & {
  variables: {
    variableResolvers: Resolver[]
  }
}

export type ServerlessOptions = Serverless.Options & {
  ssmOfflineStages?: string
}