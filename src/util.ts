import { readFile, existsSync } from 'fs'

export const getValueFromEnv = (key: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    if (!existsSync('.env')) {
      resolve(null)
      return
    }

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
}


export const getMajorAndMinorVersion = (version: string): [number, number] => {

  const [major, minor] = version.split('.').map(Number)

  return [major, minor]

}