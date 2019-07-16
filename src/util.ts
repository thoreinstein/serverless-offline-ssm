import { readFileSync } from 'fs'

type VariableObject = {
  [key: string]: any
}

export function getVarsFromEnv(): VariableObject {
  return readFileSync('.env', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .reduce((acc: VariableObject, line: string) => {
      const [key, value] = line.split(/=(.*)/)
      acc[key] = value
      return acc
    }, {})
}
