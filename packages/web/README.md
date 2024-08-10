# Configuration

# Production

Ensure the `.env.prod` file exists with keys:

```bash
ENV_VAR=prod
MINIO_ROOT_USER=username
MINIO_ROOT_PASSWORD=password
MINIO_URL=http://localhost:5130
LIBSQL_URL=http://localhost:5120
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

Ensure the `.env.dev` file exists, can use this template:

```bash
ENV_VAR=dev
MINIO_ROOT_USER=username
MINIO_ROOT_PASSWORD=password
MINIO_URL=http://localhost:5130
LIBSQL_URL=http://localhost:5120
```

To start the server:

```bash
docker compose -f compose.dev.yml up -d
```

To stop the server:

```bash
docker compose -f compose.dev.yml down
```
