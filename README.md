# serverless-offline-ssm

This [Serverless](https://github.com/serverless/serverless) plugin allows you to develop offline while using AWS SSM parameters in your `serverless.yml` template. The plugin looks for environment variables which are fulfilled by SSM parameters at build time and substitutes them from a `.env` file when running locally with the [serverless-offline plugin](https://github.com/dherault/serverless-offline).

## NOTE!!

Version `6.x` only works with `Serverless 3+`. Version `5.X` only works `Serverless 1.69+`, if you'd like to use this
plugin with `Serverless <= 1.59` use version `4.1.2`

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

yarn add -D serverless-offline serverless-offline-ssm
```

Then inside of your project's `serverless.yml` file add the following to the plugins section. Note it is important that `serverless-offline-ssm` is loaded before `serverless-offline`. This is important to ensure that we are setting the variables properly for `serverless-offline` before it needs them.

_NOTE:_ It is imperative that `serverless-offline-ssm` be the the first plugin listed in the plugins section of your `serverless.yml` file. Due to the load order of plugins, other plugins may interfere with the loading of your `.env` file.

```yaml
plugins:
    - serverless-offline-ssm
    - serverless-offline
```

## Configuration

You can choose to use a `.env` file and/or define your variables in
`serverless.yml`. Variables within `serverless-offline-ssm` take precedence.
`serverless-offline-ssm` will always check if the section `custom.serverless-offline-ssm`
have any values, if not it will fallback to `.env`

### Stages

This plugin executes if the stage defined within the plugin options
or provider sections of your `serverless.yaml` are includes within the
`stages` property of the plugin configuration. If this condition has not been
met the plugin has no effect.

The `stages` property of the plugin configuration can be overridden with a
cli parameter `--ssmOfflineStages` which takes a comma separated list of
stages.

### .env

Your `.env` file needs to contain only variable names without the `ssm:` prefix and `~(true|false|split)` sulfix.

If you've defined `${ssm:lambda.LAMBDA_NAME.DB_DSN~true}` in `serverless.yml` file your `.env` need to be like the example bellow:

```
lambda.LAMBDA_NAME.DB_DSN="VAR VALUE"
```

### serverless.yml

```yaml
provider:
  stage: offline
custom:
  serverless-offline-ssm:
    stages:
      - offline
    ssm:
      'lambda.LAMBDA_NAME.DB_DSN': 'sample-value-goes-here'
      'another.sample.value': '99 red baloons'
```

### ssmPrefix

To help keep `.env` files simple you can apply the constant `ssmPrefix` within `serverless-offline-ssm` in `serverless.yml`
to be removed from the start of the SSM variable name when fetching from `.env` or the `ssm` serverless config.

For example if you have the following SSM params defined in `serverless.yml`:

- `${ssm:/application-name/stage/PARAMETER_NAME1}`
- `${ssm:/application-name/stage/PARAMETER_NAME2}`

Setting the `ssmPrefix` option in the configuration:

```yaml
custom:
  serverless-offline-ssm:
    ssmPrefix: /application-name/stage/
```

Will simplyfy the `.env` file to:

```
PARAMETER_NAME1="offline-value1"
PARAMETER_NAME2="offline-value2"
```

It also applies to ssm params defined in the config:

```yaml
custom:
  serverless-offline-ssm:
    ssmPrefix: /application-name/stage/
    ssm:
      PARAMETER_NAME1: 'sample-value-1'
      PARAMETER_NAME2: 'sample-value-2'
```

## Contributing

Pull requests are always welcome. Please see the [contributing](https://github.com/janders223/serverless-offline-ssm/blob/master/CONTRIBUTING.md) guidelines.

## License

[MIT](https://github.com/janders223/serverless-offline-ssm/blob/master/LICENSE)
