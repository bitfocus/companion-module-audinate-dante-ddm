# companion-module-audinate-dante

See [HELP.md](./companion/HELP.md) for user documentation.

See [LICENSE]

## Development

During development, you'll need to inform Companion where to look for dev modules (like this one).

Follow the guide here
<https://github.com/bitfocus/companion-module-base/wiki>.

This module was developed for Companion 3.0 beta. It may work with Companion 2.0 as well, but this is untested.

Alternatively, if you are running Companion itself directly from its source code, create a symbolic link in `module-local-dev`

### GraphQL CodeGen

GraphQL CodeGen generates TypeScript types based on the GraphQL schema and operations (mutations, queries, etc.)

`npm run graphql-codegen` needs to run during development upon the first run, and whenever the schema changes

## Release

We have not worked out the release process yet; for example, do we need to pre-transpile the TypeScript? TBD

## Maintainers

* James Abbottsmith <james.abbottsmith@audinate.com>
