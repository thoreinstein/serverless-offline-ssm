import { readFile } from 'fs'

export const getValueFromEnv = (key: string): Promise<string> =>
  new Promise((resolve, reject) => {
    readFile(
      '.env',
      { encoding: 'utf-8' },
      (err: NodeJS.ErrnoException | null, data: string) => {
        if (err) {
          reject(err)
          return
        }

        const values = data
          .trim()
          .split('\n')
          .map(line => line.split(/=(.*)/))
          .reduce<Record<string, string>>(
            (accumulation, [key, value]) => ({
              ...accumulation,
              [key]: value,
            }),
            {},
          )

        resolve(values[key])
      }
    )
  })
