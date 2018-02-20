# serverless-offline-ssm

This [Serverless](https://github.com/serverless/serverless) plugin allows you to develop offline while using AWS SSM parameters in your `serverless.yml` template. The plugin looks for environment variables which are fulfilled by SSM parameters at build time and substitutes them from a `.env` file when running locally with the [serverless-offline plugin](https://github.com/dherault/serverless-offline).

## Documentation

- [Installation](#installation)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Installation

First install the plugins using npm or yarn

```bash
npm install serverless-offline serverless-offline-ssm --save-dev

#or

yarn install -D serverless-offline serverless-offline-ssm
```

Then inside of your project's `serverless.yml` file add the following to the plugins section. Note it is important that `serverless-offline-ssm` is loaded before `serverless-offline`. This is important to ensure that we are setting the variables properly for `serverless-offline` before it needs them.

```yaml
plugins:
    - serverless-offline-ssm
    - serverless-offline
```

## Configuration

By default `serverless-offline-ssm` will look for local variables to be defined in a file called `.env` that lives at the root of your project. The plugin uses a fairly limited regex to match the variable name from the ssm string in `serverless.yml` to the value defined in the `.env` file. By default the regex will match on *nix style environment variables; i.e. `ENV_VAR` or `VAR`. Therefore given the ssm string `${ssm:ENV_VAR}` in `serverless.yml` the plugin wil look for `ENV_VAR` to be defined in the `.env` file using the following standard format `ENV_VAR=value`.

It is possible to override both the location and name of the `.env` file as well as the regex used to match ssm parameters using custom attributes in your `serverless.yml` file.

```yaml
custom:
    ssm_regex: "[a-zA-Z0-9_-]"
    env_file: "relative/path/to/file"
```

## Contributing

Pull requests are always welcome. Please see the [contributing](https://github.com/janders223/serverless-offline-ssm/blob/master/CONTRIBUTING.md) guidelines.

## License

[MIT](https://github.com/janders223/serverless-offline-ssm/blob/master/LICENSE)
