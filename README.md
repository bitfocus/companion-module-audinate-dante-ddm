# companion-module-audinate-dante-ddm

This module enables the ability to set Dante subscriptions using a managed Dante domain. It uses the GraphQL API provided by Dante Domain Manager.

## User Documentation

See [HELP.md](./companion/HELP.md) for user documentation which is also what is displayed to the user when they click on the help icon in the UI.

### GraphQL CodeGen

GraphQL CodeGen generates TypeScript types based on the GraphQL schema and operations (mutations, queries, etc.)

`yarn run graphql-codegen` needs to run during development upon the first run, and whenever the schema changes

## Development

During development, you'll need to inform Companion where to look for dev modules (like this one).

Alternatively, if you are running Companion itself directly from its source code, create a symbolic link in `companion/module-local-dev` to this directory.

In general, follow the guide here
<https://github.com/bitfocus/companion-module-base/wiki>.

To run the project, run `yarn run dev`.

To build a .tgz file and use that to point in companion app, run `yarn run build:module`, after running this `companion-module-audinate-dante-ddm.tgz` should appear in the root directory of the project. Make sure to update module version numbers in manifest to create a dev build.

Run `yarn run test` to run tests. Please make sure you have openssl or libressl already installed on your system/container, before running the tests.

## Maintainers

- James Abbottsmith <james.abbottsmith@gmail.com>

## License

See [LICENSE](./LICENSE)
