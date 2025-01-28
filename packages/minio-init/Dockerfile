# ---------------------------------------------------------------------------------------------------------------------
# Part 1: Create base image with NodeJS and configure PNPM with cache.
# ---------------------------------------------------------------------------------------------------------------------

# First create a minimal image using NodeJS 22.6+, then assign the area where PNPM CLI will be installed using the
# PNPM_HOME enviroment variable. Next ensure PNPM_HOME is on the path so our shell can use it's CLI, finally enable the
# corepack feature of NodeJS to allow PNPM binaries to be visible.
FROM node:22.6.0-bookworm AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm && corepack prepare pnpm@9 --activate
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Install the linux packages necessary for minio admin
RUN apt-get update -y
RUN curl https://dl.min.io/client/mc/release/linux-arm64/mc --create-dirs -o /home/minio-binaries/mc
RUN chmod +x /home/minio-binaries/mc
ENV PATH=$PATH:/home/minio-binaries/

# ---------------------------------------------------------------------------------------------------------------------
# Part 2: Install all pnpm packages to a cached volume.
# ---------------------------------------------------------------------------------------------------------------------

# Installing the pnpm packages in a separate stage with only the "package.json" and "pnpm-lock.yaml" files copied over
# minimizes cache misses such that a miss only occurs when these files change. If the entire project is copied, any
# small change could trigger a cache miss and cause docker to reinstall all packages again.
FROM base AS deps

# copy the workspace root files
COPY package*.json pnpm-*.yaml /app/

# copy each package's files
COPY packages/minio-init/package*.json /app/packages/minio-init/

# Setup a mounted volume to be used as a cache, with id=pnpm, at the location /pnpm/store. Finally install the pnpm
# packages.
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts

# ---------------------------------------------------------------------------------------------------------------------
# Part 3: Build the application.
# ---------------------------------------------------------------------------------------------------------------------

# Copy over the application & move to that directory
FROM deps AS build
COPY ../.. /app
WORKDIR /app

# Build the 'minio-init' script
RUN pnpm --filter=minio-init run build

# Deploy the minio-init script
RUN pnpm deploy --filter=minio_init --prod /minio_init

# ---------------------------------------------------------------------------------------------------------------------
# Part 4 (PROD): Copy minimal files, install only production dependencies, and start the app.
# ---------------------------------------------------------------------------------------------------------------------

# First copy over the pnpm "minio-init" deployment. This will add all dependencies into a node_modules/ folder including
# packaging up any monorepo dependencies. Next copy over the built minio-init application into the app/ directory
# as this is the entrypoint for the script.
FROM base AS prod
COPY --from=build /minio_init /app
COPY --from=build /app/packages/web/build/ /app/build

# Change to the /app directory and run the script
WORKDIR /app
ENTRYPOINT ["node", "./dist/bin.js"]