# companion-module-audinate-dante-ddm

This module enables the ability to set Dante subscriptions using a managed Dante domain. It uses the GraphQL API provided by Dante Domain Manager.

## User Documentation

See [HELP.md](./companion/HELP.md) for user documentation which is also what is displayed to the user when they click on the help icon in the UI.

## Development

During development, you'll need to inform Companion where to look for dev modules (like this one).

Alternatively, if you are running Companion itself directly from its source code, create a symbolic link in `companion/module-local-dev` to this directory.

In general, follow the guide here
<https://github.com/bitfocus/companion-module-base/wiki>.

This module was developed for Companion 3.0 beta. It may work with Companion 2.0 as well, but this is untested.

### GraphQL CodeGen

GraphQL CodeGen generates TypeScript types based on the GraphQL schema and operations (mutations, queries, etc.)

`npm run graphql-codegen` needs to run during development upon the first run, and whenever the schema changes

## Maintainers

- James Abbottsmith <james.abbottsmith@gmail.com>

## License

See [LICENSE](./LICENSE)
