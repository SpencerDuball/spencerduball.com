# Configuration

# Production

Ensure the `/.env.prod` file exists with keys:

```bash
ENV_VAR=prod
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
ENV_VAR=prod
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
