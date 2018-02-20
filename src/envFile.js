import { readFileSync } from 'fs'

export default (path = '.env') => readFileSync(path, { encoding: 'utf-8' }).trim().split('\n')
