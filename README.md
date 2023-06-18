<p align="center">
  <a href="https://spencerduball.com">
    <img alt="spencerduball.com" src="/doc/images/android-chrome-256x256.png" width="150" />
  </a>
</p>

The personal website for Spencer Duball. I write about web development, cloud computing, 3D printing, circuit design, and more.

<p align="center">
Have a visit, <a href="https://spencerduball.com">spencerduball.com</a>!
</p>

<br />

# Getting Started

> **Prerequisites**: You will need at least [NodeJS 16](https://nodejs.org) and [pnpm](https://pnpm.io/) installed. You also need to have an AWS account and [AWS credentials configured locally](https://docs.sst.dev/advanced/iam-credentials#loading-from-a-file).

To get started with development:

1. Clone the repo and install dependencies:
```bash
pnpm i
```

2. Run the `sst dev` command in order to setup your local environment with secrets for your stage.
> **Note**: You will be asked what you prefer for the default stage name, you should use the stage name `dev`. You can always check what default stage is configured by looking at `/.sst/stage` txt file.
```bash
pnpm -w run dev
```

3. Start the website in development mode:
```bash
# the '--stage dev' can be omitted and the default stage will be used
pnpm --filter @spencerduballcom/web run dev
```

# Project Overview

This project consists of three workspaces:
- `-w` - This is the root workspace, this is used for running the sst console, deploying the whole stack to a stage, remove the whole stack from a stage, and setting/reading secrets.
- `@spencerduballcom/web` - This workspace is the main web project. This will hold the Remix app source code.
- `@spencerduballcom/db` - This workspace is the database project. This holds two sub-packages `@spencerduballcom/db/ddb` and `@spencerduballcom/db/pg` for the dynamodb and postgres database configurations respectively. This package also holds the database migrations, database scripts (seeds, migrate, clear, purge), etc.

## Working on `@spencerduballcom/db`

When working on the db package there are a few main workflows:
1. Running database scripts.
2. Generating a new migration.
3. Working on fixes/features.

### 1. Running Scripts

When working on the site, there are many occasions when you might need to run some common database scripts. For example, you might have incorrect logic and need to re-seed the database. Here are the common database scripts and how to run them:

> **Note**: All of these scripts accept the `--stage (prod|dev)` flag. If no flag is provided then the default stage will be used, an example command with this flag: `pnpm --filter @spencerduballcom/db run db:seed --stage prod`.

- `pnpm --filter @spencerduballcom/db run db:purge` - This script will purge (remove) all records from the database, but keep all tables and migrations in place.
- `pnpm --filter @spencerduballcom/db run db:clear` - This script will remove all tables, migrations, and data from the database. When your database is in a broken state and can't be corrected, this is the escape hatch to bring the db back to a "like new" state.
- `pnpm --filter @spencerduballcom/db run db:seed` - This script will apply the seed data found in `/packages/db/seed/transactions` to your database. More info on creating new seed data later.
- `pnpm --filter @spencerduballcom/db run db:setup` - This script is the same as running migrate and then seed. It takes a "like new" database and makes it ready to be interacted with.
- `pnpm --filter @spencerduballcom/db run db:reset` - This script is the same as running clear and then reset. It will return a database to a "like new" state and then apply migrations and seed the database. When your database is in an errant state, this is an escape hatch to return everything back to a normal working state.

### 2. Generating a New Migration

When adding new features to the site we typically need a new database migration. We need these migrations to be run chronologically so we will name these files based upon a timestamp and short description of the update. Further, there is a common pattern the migration files need to follow - for this reason there is a script to generate these filenames for us:

```bash
pnpm --filter @spencerduballcom/db run new-migration`
```

Typically when generating new migrations we will want to have some seed data for the new tables. This seed data should be created in the `/packages/db/scripts/seed/transactions` folder. If we wan't to generate seed data we can create a new generator in the `/packages/db/scripts/seed/generators` folder. The workflow typically will involve generating the seed data and then copying this data into the appropriate `transactions/` folder. This is to make sure that our seed data is reproducable between each `db:seed` script call.

### 3. Working on Fixes/Features

When making a fix or adding a feature the source code of our project will be modified. In order to make sure these changes reflect in our projects we will need to run `pnpm --filter @spencerduballcom/db run build` to generate the new output artifacts in the `/packages/db/dist` folder. If you have the site running when generating new artifacts, you may need to shut the site down and then run the process again so the new package can be loaded.

