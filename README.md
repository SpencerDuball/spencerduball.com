<p align="center">
  <a href="https://spencerduball.com">
    <img alt="spencerduball.com" src="/doc/images/icon-256x256.png" width="150" />
  </a>
</p>

The personal website for Spencer Duball. I write about web development, cloud computing, 3D printing, circuit design, and more.

<p align="center">
Have a visit, <a href="https://spencerduball.com">spencerduball.com</a>!
</p>

<br />

# Getting Started

> **Prerequisites**: You will need at least [NodeJS 16](https://nodejs.org) and [pnpm](https://pnpm.io/) installed. You also need to have an AWS account and [AWS credentials configured locally](https://docs.sst.dev/advanced/iam-credentials#loading-from-a-file). Finally, these docs will install a couple of programs with [Homebrew](https://docs.brew.sh/Installation) for running a local database.

To get started with local development:

1. Install a couple of programs for local development:
   > Note: These programs do not need to be installed via Homebrew and can be installed anyway you like.

Intall `sqld`: https://github.com/tursodatabase/libsql/blob/main/docs/BUILD-RUN.md#build-and-install-with-homebrew

```bash
brew tap libsql/sqld
brew install sqld
sqld --version # confirm installation
```

Install `turso`: https://docs.turso.tech/reference/turso-cli#homebrew-macos-and-linux

```bash
brew install tursodatabase/tap/turso
turso --version # confirm the installation
```

2. Clone the repo and install dependencies:

```bash
pnpm i
```

3. Run the `sst dev` command in order to setup your local environment with secrets for your stage.
   > **Note:** You will be asked what the default stage name should be, you should use your Github username (or another unique identifier). Such that two people will not deploy to the same stage name. Reserved stage names are `staging` and `prod`. If you have forgotten your stage name, you can check by looking at the `/.sst/stage` txt file.

```bash
pnpm run dev
```

4. Set the secrets for the application. Note that the only secret who's value matters for local development is the DATABASE_URL. Ensure to set this to `http://127.0.0.1:{port}` where your port number can be any valid port:

```bash
pnpm sst secrets set DATABASE_AUTH_TOKEN "database_auth_token"
pnpm sst secrets set DATABASE_URL "http://127.0.0.1:8080"
pnpm sst secrets set GITHUB_CLIENT_ID "github_client_id"
pnpm sst secrets set GITHUB_CLIENT_SECRET "github_client_secret"
```

5. Contrats! All one-time items have been setup, now continue to the [Development](#development) section to begin working on the site.

# Project Overview

This project is a `pnpm` monorepo deployed to AWS with [SST](https://sst.dev/). The main website is built using the [Remix](https://remix.run) framework and deployed to [AWS Lambda](https://aws.amazon.com/lambda/). The file storage is implemented using [AWS S3](https://aws.amazon.com/s3/), the K/V storage is implemented with [AWS DynamoDB](https://aws.amazon.com/dynamodb/), and the SQLite database is hosted via (Turso)[https://turso.tech]. This site also uses [AWS CloudFront](https://aws.amazon.com/cloudfront/) as the CDN + reverse proxy, and [AWS Route 53](https://aws.amazon.com/route53/) for DNS hosting.

This monorepo is divided into 5 packages:

- `-w` This is the root workspace, this is used for running the sst console, deploying the stack to a stage, removing the stack from a stage, and setting/reading secrets.
- `@spencerduballcom/web` This is the main package which holds the Remix site. Most development will be done here.
- `@spencerduballcom/db` This package holds the configuration and setup for interacting with the databases. This package is separated so that any of the other packages may use this interface, not just the main web package. There are 2 subpackages which provide the interface for the SQL and DynamoDB databases respectively:
  - `@spencerduballcom/db/sqldb` The MySQL database interface.
  - `@spencerduballcom/db/ddb` The DynamoDB database interface.
  - Note that S3 has a simple interface provided from `@aws-sdk/client-s3` and having an abstraction does not provide any benefit.
- `@spencerduballcom/functions` This package implements lambda functions which are used in deployment of the app, or just separate from the main web package.
- `@spencerduballcom/scripts` This package implements the scripts used by this project. These scripts include updating environment variables (different from secrets), running database migrations/seeds/reset/startup/etc, any other miscellaneous scripting tasks.

## Development

After following the [Getting Started](#getting-started) section and peforming the one-time-install of programs, development work can get started. There are 3 main environments or stages that are used:

- `dev` The dev stage can be named anything, and if there are multiple developers it should be unique such that two developers never use the same stage. A unique set of resources will be deployed for every development stage that is created.
- `staging` This is a fixed stage name where the site is deployed for testing before pushing to production.
- `prod` This is the production stage, live to users at https://spencerduball.com

When developing a new features typically an update to the database will need to be made, then an update to the seed data, and finally an update to the website. After everything has been implemented and the feature works locally, this feature should be deployed to the staging environment where further automated and QA testing can be performed. When it is confirmed that the feature works correctly it can then be pushed to production. The next few sections will document in greater detail the processes involved at each stage of the development cycle.

### Running the Website

To get the website up and running locally:

> Important! Refer to the [scripts](#scripts) section for more information about the seeding process. Running `db:setup` everytime can be wasteful, and in most situations you will want to use `db:seed:replant` when attempting to reset data locally.

```bash
# start the database (long running process)
pnpm --filter @spencerduballcom/scripts run db:start
# apply the seed data
pnpm --filter @spencerduballcom/scripts run db:setup
# start the website (long running process)
pnpm --filter @spencerduballcom/web run dev
```

### Updating Database Schema

There are two database schemas that may need an update, SQLite and DynamoDB.

#### DynamoDB

The DynamoDB schema can be updated by going to the `packages/db/src/ddb` and adding or updating items as necessary. After adding or updating the schema of items that are uploaded/queried from DynamoDB ensure to build so other packages can access this:

> Note: In VSCode, the TypeScript server will need to be restarted after making a build for this package. If not restarted, Intellisense won't be able to find the correct output files.

```bash
pnpm --filter @spencerduballcom/db run build
```

#### SQLite

Updating SQLite schema is more complicated. We will first need to update the TypeScript definitions in the `@spencerduballcom/db` package. These definitions are used ONLY for intellisense when consuming this package. Next we will implement a migration, implement the habitat script, and implement the seed script - these actions all occur in the `@spencerduballcom/scripts` package.

1. <u>Update TypeScript Definitions</u> - In the `packages/db/src/sqldb` file we can create a new interface, add it to the package export, and finally build the output.

> Note: In VSCode, the TypeScript server will need to be restarted after making a build for this package. If not restarted, Intellisense won't be able to find the correct output files.

```bash
pnpm --filter @spencerduballcom/db run build
```

2. <u>Generate Migration, Habitat, Seed Scripts</u> - From the scripts package we will generate a new migration and associated habitat and seed scripts.

```bash
pnpm --filter @spencerduballcom/scripts run db:migrate:create
```

3. <u>Implement Migration Script</u> - To implement the migration script we have to add the appropriate commands for brining a migration up, and bringing a migration down. Anytime a migration is implemented we should run the migrations to ensure it works, and then `db:reset` + `db:migrate` to ensure there are no isseus with our `up`/`down` scripts. This new migration script can be found in the `packages/scripts/migrations/{migration_name}` folder.

4. <u>Implement Habitat Script</u> - A habitat script is part of the seeding process where mostly permanent data is either uploaded or added to DynamoDB. Most times this script is not needed, examine prior scripts to see how this is useful. This file can be found in the `packages/scripts/seed/{migration_name}/habitat` folder.

5. <u>Implement Seed Script</u> - A seed script is used to populate the SQLite database, S3 bucket, and DynamoDB table with items that should be reset. This file can be found in the `packages/scripts/seed/{migration_name}/seed` folder.

### Scripts

This section gives an overview of the main scripts that will be run when developing.

- Database Scripts:

  - `pnpm --filter @spencerduballcom/scripts run db:migrate:create <name>` - Generates a new migration, habitat, and seed script.
  - `pnpm --filter @spencerduballcom/scripts run db:migrate:status` - Prints the status of all migrations applied and not applied.
  - `pnpm --filter @spencerduballcom/scripts run db:migrate` - Applies all migrations up to the latest migration.
  - `pnpm --filter @spencerduballcom/scripts run db:seed` - Removes all habitat and seed data, and then adds all habitat and seed data.
  - `pnpm --filter @spencerduballcom/scripts run db:seed:replant` - Removes all seed data, and then adds all seed data.
  - `pnpm --filter @spencerduballcom/scripts run db:seed:reset` - Removes all habitat and seed data.
  - `pnpm --filter @spencerduballcom/scripts run db:reset` - Removes all data and migrations.
  - `pnpm --filter @spencerduballcom/scripts run db:setup` - Applies all migration, and adds all habitat and seed data.
  - `pnpm --filter @spencerduballcom/scripts run db:start` - Starts the localhost database.

- SST Scripts:
  - `pnpm sst dev` - Launches the SST console, pulls down the configuration/serets for intellisense, deploys dev stage resources.
  - `pnpm sst deploy --stage staging` - Deploys the `staging` stage.
  - `pnpm sst deploy --stage prod` - Deploys the `prod` stage.
  - `pnpm sst secrets set <secret_name> <secret_value> [--stage stage]` - Sets a secret for the specified stage.
  - `pnpm sst secrets list [--stage stage]` - Prints all secrets and their values.

## Design

The design for multipart systems such as authentication and theme settings are contained in the following links:

- [Authentication/Authorization](/doc/design/auth.md)
- [Website Theme](/doc/design/theme.md)
