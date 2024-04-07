# ---------------------------------------------------------------------------------------------------------------------
# Part 1: Create base image with NodeJS, install packages for sqlite, configure PNPM with cache.
# ---------------------------------------------------------------------------------------------------------------------

# First create a minimal image using NodeJS 21.7+, then assign the area where PNPM CLI will be installed using the
# PNPM_HOME enviroment variable. Next ensure PNPM_HOME is on the path so our shell can use it's CLI, finally enable the
# corepack feature of NodeJS to allow PNPM binaries to be visible.
FROM node:21.7-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install the linux packages necessary for sqlite
RUN apt-get update -y && apt-get install -y sqlite3

# ---------------------------------------------------------------------------------------------------------------------
# Part 2: Install all pnpm packages to a cached volume.
# ---------------------------------------------------------------------------------------------------------------------

# Installing the pnpm packages in a separate stage with only the "package.json" and "pnpm-lock.yaml" files copied over
# minimizes cache misses such that a miss only occurs when these files change. If the entire project is copied, any
# small change could trigger a cache miss and cause docker to reinstall all packages again.
FROM base AS deps
COPY package.json pnpm-lock.yaml /spencerduballcom/

# Setup a mounted volume to be used as a cache, with id=pnpm, at the location /pnpm/store. Finally install the pnpm
# packages.
WORKDIR /spencerduballcom
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------------------------------------------------
# Part 3: Build the application.
# ---------------------------------------------------------------------------------------------------------------------

# Copy over the application & move to that directory
FROM deps AS build
COPY . /spencerduballcom
WORKDIR /spencerduballcom

# Build the remix application.
RUN pnpm run build

# ---------------------------------------------------------------------------------------------------------------------
# Part 4 (PROD): Copy minimal files, install only production dependencies, and start the app.
# ---------------------------------------------------------------------------------------------------------------------

# First copy over the build/ output and the package.json + package-lock.json files.
FROM base AS prod
COPY --from=build /spencerduballcom/build /spencerduballcom/build
COPY --from=build /spencerduballcom/package.json /spencerduballcom/pnpm-lock.yaml /spencerduballcom/

# Next copy over the scripts/ folder and start.prod.sh so we can apply database migrations
COPY --from=build /spencerduballcom/scripts /spencerduballcom/scripts
RUN rm -rf /spencerduballcom/scripts/seed
COPY --from=build /spencerduballcom/start.prod.sh /spencerduballcom/start.prod.sh

# Next install the production dependencies only utilizing the cached packages.
WORKDIR /spencerduballcom
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Setup environment variables
ENV DATABASE_URL="/data/sqlite.db"

# Finally run the application on port 8080, the preferred port recommened by fly.io. Note the Remix application will
# use the PORT environment variable when the CLI is used to start the application.
EXPOSE 8080
ENV PORT="8080"

RUN chmod +x start.prod.sh
ENTRYPOINT [ "./start.prod.sh" ]

# ---------------------------------------------------------------------------------------------------------------------
# Part 4 (STAGE): Copy minimal files, install only production dependencies, and start the app.
# ---------------------------------------------------------------------------------------------------------------------

# First copy over the build/ output and the package.json + package-lock.json files.
FROM base AS stage
COPY --from=build /spencerduballcom/build /spencerduballcom/build
COPY --from=build /spencerduballcom/package.json /spencerduballcom/pnpm-lock.yaml /spencerduballcom/

# Next copy over the scripts/ folder and start.stage.sh so we can apply database migrations
COPY --from=build /spencerduballcom/scripts /spencerduballcom/scripts
COPY --from=build /spencerduballcom/start.stage.sh /spencerduballcom/start.stage.sh

# Next install the production dependencies only utilizing the cached packages.
WORKDIR /spencerduballcom
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Setup environment variables
ENV DATABASE_URL="/data/sqlite.db"

# Finally run the application on port 8080, the preferred port recommened by fly.io. Note the Remix application will
# use the PORT environment variable when the CLI is used to start the application.
EXPOSE 8080
ENV PORT="8080"

RUN chmod +x start.stage.sh
ENTRYPOINT [ "./start.stage.sh" ]