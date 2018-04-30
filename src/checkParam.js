export default (envValue) => {
  if (envValue === undefined || (typeof envValue === 'string' &&  envValue.startsWith('${ssm:'))) {
    return true;
  }

  return false
}
