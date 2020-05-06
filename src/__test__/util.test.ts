import fs from 'fs'
import { getValueFromEnv } from '../util'

jest.mock('fs')

describe('util', () => {
  const readFile = (fs.readFile as any) as jest.Mock

  beforeEach(() => {
    readFile.mockClear()
  })

  describe('getValueFromEnv', () => {
    const key = '__KEY_2__'
    const value = '__VALUE_2__'
    const data = `__KEY_1__=__VALUE_1__\n${key}=${value}\n__KEY_3__=__VALUE_3__`
    const err = new Error('__FAILED__')

    it('resolves with the variable identified by the supplied key', () => {
      const resolved = getValueFromEnv(key)

      expect(readFile).toHaveBeenCalledWith(
        '.env',
        { encoding: 'utf-8' },
        expect.any(Function)
      )

      // trigger the callback manually
      const [[,, callback ]] = readFile.mock.calls
      callback(null, data)

      return expect(resolved).resolves.toEqual(value)
    })

    it('rejects when failing to read the .env file', async () => {
      const resolved = getValueFromEnv(key)

      // trigger the callback manually
      const [[,, callback ]] = readFile.mock.calls
      callback(err)

      await expect(resolved).rejects.toEqual(err)
    })
  })
})
