import { getValueFromEnv } from './util'
import { 
  ServerlessOptions, 
  ServerlessOffline,
  CustomOptions, 
} from './types'

type AWSParams = { Name: string, WithDecryption?: boolean }

export type Resolver = {
  regex: RegExp
  resolver: (name: string) => Promise<string | void>
  serviceName?: string
}

export type ResolverV2 = {
  regex: RegExp
  resolver: (name: string) => Promise<string | void>
  serviceName?: string
}

type AWSRequest = (
  service: string, 
  method: string, 
  params: AWSParams, 
  options: ServerlessOptions,
) => Promise<unknown>

export default class ResolverHandler {

  constructor(
    private serverless: ServerlessOffline,
    private options: ServerlessOptions,
    private customOptions: CustomOptions,
  ) {}

  public async getValue(key: string) {
    return this.customOptions.ssm?.[key] || await getValueFromEnv(key)
  }

  public apply(major: number) {
    
    // can be improved
    if (major <= 2) {
      this.applyV2()
    } else if (major >= 3) {
      this.applyV3()
    }
  }

  public applyV3() {
    const aws = this.serverless.getProvider('aws')
      
    if (aws) {
      const ssmRequest = aws.request.bind(aws);
      aws.request = this.V3(ssmRequest)
      this.serverless.setProvider('aws', aws)
    }
  }

  public V3(ssmRequest: AWSRequest): AWSRequest {
    return async (service: string, method: string, params: AWSParams) => {

      if (service !== 'SSM' || method !== 'getParameter') {
        return ssmRequest(service, method, params, this.options);
      }

      const name = params.Name
      const Value = await this.getValue(name)
      
      return { Parameter: { Value, Type: 'String', ...params } };
    }
  }

  public applyV2() {
    const ssmResolverInstance = this.serverless.variables.variableResolvers
        .find(({ serviceName }) => serviceName === 'SSM')

    if (ssmResolverInstance) {
      ssmResolverInstance.resolver = this.V2(ssmResolverInstance)
    }
  }

  public V2(ssmResolver: Resolver) {
    return async (name: string): Promise<string | void> => {
      const [,, key] = name.match(ssmResolver.regex) || []

      if (!key) return
  
      const Value = await this.getValue(key)

      if (key.startsWith('/aws/reference/secretsmanager')) {
        try {
          return JSON.parse(Value);
        } catch (e) {
          return Value;
        }
      } 
  
      return Value
    }
  }
}  