import fs from 'fs'
import { getValueFromEnv } from '../util'

jest.mock('fs')

describe('util', () => {
  const readFile = (fs.readFile as any) as jest.Mock
  const existsSync = (fs.existsSync as any) as jest.Mock

  beforeEach(() => {
    readFile.mockClear()
    existsSync.mockClear()
  })

  describe('getValueFromEnv', () => {
    const existingKey = '__KEY_2__'
    const missingKey = '__KEY_4__'
    const slashKey = '/key'
    const slashData = '/key=slash-value'
    const slashValue = 'slash-value'
    const value = '__VALUE_2__'
    const data = `__KEY_1__=__VALUE_1__\n${existingKey}=${value}\n__KEY_3__=__VALUE_3__`
    const err = new Error('__FAILED__')

    it('resolves with the variable identified by the supplied key', () => {
      existsSync.mockReturnValue(true)

      const resolved = getValueFromEnv(existingKey)

      expect(readFile).toHaveBeenCalledWith(
        '.env',
        { encoding: 'utf-8' },
        expect.any(Function),
      )

      // trigger the callback manually
      const [[, , callback]] = readFile.mock.calls
      callback(null, data)

      return expect(resolved).resolves.toEqual(value)
    })

    it('resolves values with keys with leading slashes', () => {
      existsSync.mockReturnValue(true)

      const resolved = getValueFromEnv(slashKey)

      expect(readFile).toHaveBeenCalledWith(
        '.env',
        { encoding: 'utf-8' },
        expect.any(Function),
      )

      // trigger the callback manually
      const [[, , callback]] = readFile.mock.calls
      callback(null, slashData)

      return expect(resolved).resolves.toEqual(slashValue)
    })

    it('resolves with undefined when the supplied key is not found', () => {
      existsSync.mockReturnValue(true)

      const resolved = getValueFromEnv(missingKey)

      expect(readFile).toHaveBeenCalledWith(
        '.env',
        { encoding: 'utf-8' },
        expect.any(Function),
      )

      // trigger the callback manually
      const [[, , callback]] = readFile.mock.calls
      callback(null, data)

      return expect(resolved).resolves.toEqual(undefined)
    })

    it('resolves with undefined when .env file does not exist', () => {
      existsSync.mockReturnValue(false)

      const resolved = getValueFromEnv(existingKey)

      expect(readFile).not.toHaveBeenCalled()

      return expect(resolved).resolves.toEqual(undefined)
    })

    it('rejects when failing to read the .env file', async () => {
      existsSync.mockReturnValue(true)

      const resolved = getValueFromEnv(existingKey)

      // trigger the callback manually
      const [[, , callback]] = readFile.mock.calls
      callback(err)

      await expect(resolved).rejects.toEqual(err)
    })
  })
})
