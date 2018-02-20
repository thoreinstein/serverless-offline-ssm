export default (envValue) => {
  if (envValue === undefined || envValue.startsWith('${ssm:')) {
    return true;
  }

  return false
}
