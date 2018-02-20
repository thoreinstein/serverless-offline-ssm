import checkParam from '../checkParam'

it('checks if the param is an ssm param', () => {
  expect(checkParam('${ssm:FOO}')).toBeTruthy() // eslint-disable-line no-template-curly-in-string
})

it('doesn\'t allow non ssm params', () => {
  expect(checkParam('FOO')).toBeFalsy()
})

it('also checks if the param is undefined', () => {
  expect(checkParam(undefined)).toBeTruthy()
})
