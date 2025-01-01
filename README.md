# Docker

In production there will be two docker images used, one for the cron (`spencerduballcom-cron`) and one for the application (`spencerduballcom-web`). The application will also run litestream to snapshot the database to S3.

## Docker Images

To work on any of the docker images in the monorepo you must run docker build with a build context at the monorepo root and targeting the specific dockerfile. These instructions are helpful for developing/debugging individual containers.

### Web

The web app contains the SQLite database and all object files will be stored and served from the filesystem.

```bash
docker image build -t spencerduballcom-web -f packages/web/Dockerfile .
```

### Cron

The web app has a route setup for daily actions to be run every 24 hours or so, the cron image will ping the server on this route using a `CRON_CLIENT_SECRET` secret key.

```bash
docker image build -t spencerduballcom-cron -f packages/web/Dockerfile .
```

## Docker Compose

Before building or running any containers, you must ensure the following environment file exists with the required keys. File = `.env.production` with keys:

```bash
SITE_URL=http://spencerduball.com
CRON_CLIENT_SECRET=e17909c89f33b6c81e2d2dca09a33a0fc7bacbaa0415b55fbcab477e34355ef0 # random 64-char hex string (this is an example!)
```

To build all containers for production you can run the following command:

```bash
# pnpm script (runs below docker command)
pnpm prod:build

# docker command to build all containers for production
docker compose -f compose.prod.yaml --env-file .env.production build
```

To run all containers in production you can run the following command:

```bash
# pnpm script (runs below docker command)
pnpm prod:run

# docker command to run all containers for production
docker compose -f compose.prod.yaml --env-file .env.production up -d
```

To stop all containers in production you can run the following command:

```bash
# pnpm script (runs below docker command)
pnpm prod:stop

# docker command to stop all containers
docker compose -f compose.prod.yaml --env-file .env.production down
```

# Playwright

Inside that directory, you can run several commands:

`pnpm exec playwright test`
Runs the end-to-end tests.

`pnpm exec playwright test --ui`
Starts the interactive UI mode.

`pnpm exec playwright test --project=chromium`
Runs the tests only on Desktop Chrome.

`pnpm exec playwright test example`
Runs the tests in a specific file.

`pnpm exec playwright test --debug`
Runs the tests in debug mode.

`pnpm exec playwright codegen`
Auto generate tests with Codegen.

We suggest that you begin by typing:

`pnpm exec playwright test`

And check out the following files:

- ./tests/example.spec.ts - Example end-to-end test
- ./tests-examples/demo-todo-app.spec.ts - Demo Todo App end-to-end tests
- ./playwright.config.ts - Playwright Test configuration

Visit https://playwright.dev/docs/intro for more information. ✨
