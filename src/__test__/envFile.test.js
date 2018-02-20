import readEnvFile from '../envFile'

it('reads the contents of the default env file', () => {
  expect(readEnvFile()).toEqual(['ENV_VAR=FOO'])
})

it('reads the contents of a different env file', () => {
    expect(readEnvFile('src/__test__/.env')).toEqual([
        'FOO=BAR',
        'BAZ=QUX'
    ])
})
