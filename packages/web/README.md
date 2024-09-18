# Configuration

# Production

Ensure the `/.env.prod` file exists with keys:

```bash
SITE_URL=http://spencerduball.com
LIBSQL_URL=http://localhost:5120
MINIO_ROOT_USER=username
MINIO_ROOT_PASSWORD=password
MINIO_URL=http://localhost:5130
```

To start the server:

```bash
docker compose -f compose.yaml up -d
```

To stop the server:

```bash
docker compose -f compose.yaml down
```

# Development

Ensure the `/packages/web/.env` file exists, can use this template:

```bash
SITE_URL=http://spencerduball.com
LIBSQL_URL=http://localhost:5120
MINIO_ROOT_USER=username
MINIO_ROOT_PASSWORD=password
MINIO_URL=http://localhost:5130
```

To start the server:

```bash
docker compose -f compose.dev.yml up -d
```

To stop the server:

```bash
docker compose -f compose.dev.yml down
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
