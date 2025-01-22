# Overview

This section will capture key points in the architecture of the spencerduball.com website. This will include all parts of the site from overall architecture, frontend architecture, backend architecture, deployment, hosting, etc.

![Architecture Overview](./images/overview.md/sdc.architecture_overview.dark.svg#gh-dark-mode-only)
![Architecture Overview](./images/overview.md/sdc.architecture_overview.light.svg#gh-light-mode-only)

This project is made up of three docker containers:

- **minio** - An S3 compatible file store for images/files buckets, sqlite backup bucket, and more as needs arise.
- **web** - The public website built as a Remix/ReactRouter app.
- **worker** - An express app that is responsible for triggering cronhook routes on the Remix app, backing up the sqlite database to minio, and backing up minio to S3. It also processes logs, minifies images, and performs other CPU-intensive tasks with threads.

## web

The website will host a Remix application that functions as the public website, the CMS for all content, and the frontend for analytics. This app will use an S3 bucket on the [minio](#minio) image to write files/images for blog posts, projects, etc. A sqlite database will be used for all content such as blogs, projects, sessions, users, and more.

All requests will write their logs to a file in the `/logs/web` location, and also transport the logs to the [worker](#worker) app. The logs written to the filesystem will be mostly for tracing down any bugs, the logs sent to the worker will be for analytics.

The [web](#web) container will also have cronhook routes (webhooks intended to be called by a cron service) to perform tasks such as removing any expired ttl items in the database, removing logs on the filesystem greater than the max retention period, and any other scheduled tasks necessary for the app to function.

> This container will be stateless and if scaling is necessary can have replicas on the same machine.

## worker

The worker will be implemented as an express app, and will maintain a thread pool to perform CPU-intensive operations. It is intended to be used in a few main roles:

- Act as a cron service, calling the cronhook routes on the remix app.
- Continuously backup the database to a bucket on the [minio][#minio] server.
- Periodically (and incrementally) backup the [minio][#minio] contents to a remote S3 compatible store such as AWS S3 or CloudFlare R2.

The express app will run using [Litestream's process supervision](https://litestream.io/guides/docker/#running-in-the-same-container) so that incremental backups can be made to the [minio](#minio) bucket.

The express app will trigger cronhooks following the [standarwebhooks.com](https://www.standardwebhooks.com/) spec and hold a shared secret for signing HMAC-SHA256 payloads to the remix client.

Incremental S3 backups of the [minio](#minio) buckets will be made using the `mc mirror` command. This command will not make a full copy each time, but incremental copies of data that isn't already present in the destination. Backups will be made daily to an S3 bucket, and backups will also be made monthly to another S3 bucket from the daily S3 bucket.

![S3 Backups](./images/overview.md/sdc.s3_backup.light.svg#gh-light-mode-only)
![S3 Backups](./images/overview.md/sdc.s3_backup.dark.svg#gh-dark-mode-only)

This container will also implement a thread pool for processing CPU-intensive tasks. These tasks are offloaded to other threads so the main event loop is not blocked from receiving messages, sending cronhook events, or performing backups. These tasks include:

- Ingesting logs and processing them, producing analytics to be viewed in the remix app
- Image processing for minification

> This container will only ever be a singleton without replicas, however the number of workers in the pool can be scaled.

# Tradeoffs

The main goal in the architecture of this application is simplicity, any online resource will tell you that some of the decisions made are not scalable but they are intentional. Here I will discuss a few design decisions, why they were made, and a link to a (future) post about how they paid off.

## Minio

Minio suggests running as multiple separate minio servers with replicas for high availability and fault tolerance. I have no interest in such a complex deployment for a simple blog, but I do like the protection of data loss that hosting on S3 provides. For this reason, the setup I have chosen is self-hosting a single node minio server and performing daily and monthly incremental backups to S3.

Using the `mc mirror` command I can perform incremental backups without sending the full contents of the minio server every time I want to make a backup. This command will only send the changed contents of the minio server to S3 saving on bandwidth costs.

Furthermore I will implement a monthly backup so that any single event will not be a complete wipe of my content. This will be done by using the `mc mirror` command as well.

## Worker

This is probably the most controversial piece of the application, but there are some good tradeoffs here too. This worker will take care of A LOT of things that would be split into several containers if this was a high traffic website. For example, there should really be:

- **cron** A singleton container for all cronhooks and cronjobs to be triggered.
- **analytics** A singleton server which provides endpoints for accessing all analytics.
- **workers** A group of containers for processing all CPU-intensive jobs.

This is just a rough idea of the different services that could be had, and after considering many different breakdowns I settled on a single container with a thread pool.

### Splitting Worker into Cron + Worker w/ Threads

I could split the main worker container into two containers; a cron container, and a worker container with thread pools.

This approach doesn't really provide any benefits as I will still need an express server for the worker's thread pool to deletage tasks and have a thread ready to listen for requests. I don't get any real benefit from splitting these containers in this configuration as I still can't scale the worker container horizontally (there needs to be 1 api for log ingestion).

Anyway this is sliced the cron container sits idle almost all the time, and I still need a mostly idle thread in the worker container to listen for requests so that they don't get dropped when the main thread is busy executing jobs. Might as well keep them combined in this scenario.

### Splitting Worker into Cron + Workers

I could split the main worker container into many containers; a cron container, and a worker container (single threaded) and horizonally scalable.

This approach sounds like the best approach until the discussion of IPC comes into play. Doing this would require either a central server that is a good fit for implementing a queue (e.g. redis), a polling mechanism on a share memory space, or some other IPC scenario. All of this is a lot more complexity than I want to deal with, and I don't want to introduce another service (redis) into the mix.

At the end of the day instead of scaling horizonally as containers, it is far less complex to scale horizonally with threads in a single worker application. This takes us back to the first scenario (Cron + Worker w/ Threads), which leads us back to just combining this with the cron service.
