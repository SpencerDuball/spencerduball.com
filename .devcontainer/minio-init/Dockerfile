# ---------------------------------------------------------------------------------------------------------------------
# Part 1: Create base image with NodeJS and configure PNPM with cache.
# ---------------------------------------------------------------------------------------------------------------------

FROM node:23.6.1-bookworm-slim AS base

# install curl
RUN apt-get update -y && apt-get install -y curl

# determine the architecture and download the appropriate MinIO client
RUN if [ "$(dpkg --print-architecture)" = "amd64" ]; then \
      curl https://dl.min.io/client/mc/release/linux-amd64/mc \
      --create-dirs \
      -o /root/minio-binaries/mc; \
    elif [ "$(dpkg --print-architecture)" = "arm64" ]; then \
      curl https://dl.min.io/client/mc/release/linux-arm64/mc \
      --create-dirs \
      -o /root/minio-binaries/mc; \
    else \
      echo "Unsupported architecture"; \
      exit 1; \
    fi
RUN chmod +x /root/minio-binaries/mc
ENV PATH="$PATH:/root/minio-binaries/"