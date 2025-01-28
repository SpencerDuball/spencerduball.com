# ---------------------------------------------------------------------------------------------------------------------
# Part 1: Create base image with NodeJS and configure PNPM with cache.
# ---------------------------------------------------------------------------------------------------------------------

FROM node:23.6.1-bookworm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm && corepack prepare pnpm@10 --activate
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0