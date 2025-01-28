# Overview

![Architecture Overview](./files/overview.md/sdc.architecture_overview.dark.svg#gh-dark-mode-only)
![Architecture Overview](./files/overview.md/sdc.architecture_overview.light.svg#gh-light-mode-only)

The goals for this site's architecture are:

- **Self Host Everything** - Everything should be self hosted except for periodic backups to prevent data loss & email/sms notification service.
- **Simple Deployment** - Deploying, scaling, and monitoring the application should be simple. This means no Kubernetes or other complex means of deployment.
- **Data Backups** - All site content should be backed up periodically to prevent catastrophic data loss.
- **Scalable** - The app should be architected such that it can be vertically scalable, and may easily be turned into a horizontally scaled app.
- **Realtime** - The application should be architected so that realtime communication between users is possible. This may be for admin monitoring, realtime chat, etc.

# Images

This app is composed of 5 different docker images deployed to 1 machine:

- `minio`, `cron`, `nats`, `web`, `worker`

## minio

The minio image is pulled from `minio:latest` and is used to host the Public Bucket, Private Bucket, and Backup Bucket. The public bucket will host all publically accessible images/files for blog posts, project posts, etc. The private bucket will host all private files for admin use, metrics, etc. The backup bucket will host the continuous incremental backups of the main sqlite database `/data/data.db`, facilitated by the [cron](#cron) container via [Litestream](https://litestream.io/).

The full minio contents will be incrementally backed up to [AWS S3](https://aws.amazon.com/s3/) triggered by a cron job daily, weekly, and biweekly. This means there will be a copy of the site data 1 day old, 1 week old, and 2 weeks old stored in a public cloud for redundancy at any point in time .

> The minio container is a singleton, there are no replicas and only one process to interface with.

### Incremental Backups

In this document I mention that there are "continuous incremental backups" and "incremental backups" and purposefully differentiate between the two.

An incremental backup is a backup that copies only the changes between the source and destination, so if no changes have happened in 2 weeks there will be nothing copied to the AWS S3 buckets - this helps save a lot on bandwidth costs as a full copy of the site contents is not replicated every 1-day/1-week/2-weeks.

A continuous incremental backup will copy all changes immediately from the source to destination. Like the incremental backup, only differences from the source/destination are copied but the copies are continuous. This continuous coping of data is done from the SQLite database to the minio server. Now when incremental backups are triggered daily to AWS S3 we can be sure that the full state of the site at that point in time is copied. Without continuous incremental backups we would need to ensure the SQLite database is first copied to the minio bucket - and then copy the minio contents to S3 or else our files and database could be out-of-sync.

## cron

The cron image is a node process bundled together [with the Litestream process](https://litestream.io/guides/docker/#running-in-the-same-container). This configuration uses Litestream's built-in process supervision to run the node process and is effectively a wrapper around the node process. Litestream is responsible to continuously incrementally replicating the SQLite database (`/data/data.db`) to [minio](#minio). The node process is used to:

- Trigger daily cleanups to the `/data/ttl.db` database for sessions/otc/etc.
- Trigger daily incremental backups of the minio contents to AWS S3.
- Trigger weekly incremental backups of the `s3/daily` bucket to `s3/1-week` bucket in AWS S3.
- Trigger biweekly incremental backups of the `s3/1-week` bucket to `s3/1-week` bucket in AWS S3.

![S3 Backups](./files/overview.md/sdc.s3_backup.light.svg#gh-light-mode-only)
![S3 Backups](./files/overview.md/sdc.s3_backup.dark.svg#gh-dark-mode-only)

## nats

[NATS](https://nats.io/) is the message broker service used to setup the Work Queue and Events Pub/Sub. NATS allows for _many_ different messaging patterns, but the two that are used in this application are:

- Publish/Subscribe
- Work Queues

### Work Queue

With NATS JetStream we can create a work queue that provides **once and only once** delivery of messages to consumer (workers). The Work Queues also allow for pull consumers so the queue may grow and messages will only be processed by workers when they are ready to process the next job. Using pull consumers helps reduce the possibility where all workers are busy and work gets dropped due to unavailable workers.

The types of jobs that the work queue will handle are:

- Processing logs for analytics and metrics such as:
  - Page views
  - Geographic location of visitors
- Image processing
  - Create thumbnails for lists
  - Create different image sizes for different devices
- Etc.

After processing certain jobs we may upload the new images to the minio bucket, publish events to a NATS pub/sub channel for realtime communication (ex: page view counter, new comments), or send notifications for any errors that occurred on the website.

### Publish/Subscribe

NATS Core provides messaging patterns such as Publish/Subscribe which can be used to listen for specific types of messages to facilitate realtime communcations. This pattern is used for a few different types of events:

- `events.metrics.*` (Ex: `events.metrics.views`)
  - Any analytics events related to page view, site statistics, etc.
- `events.alerts.*` (Ex: `events.metrics.errors`/`events.metrics/warnings`)
  - Any alerts for site errors, warnings, site load spikes.
- `events.comments.*` (Ex: `events.comments.blog_032`)
  - Any new comments in general (admin panel) or to specific posts (user might get a reply).
- Etc.

## web

The web process is the main application that users will visit, all analytics will be viewable from, the admin panel will live here, and more. This app is a NodeJS server using React Router v7, PandaCSS for styling, minio for file storage, and sqlite for it's database interactions. The way it interacts with other other parts of the system are:

- `/data/data.db` - This is the main database which houses most of the site content except for temporary records and files.
- `/data/ttl.db` - This houses temporary records such as user sessions, one-time-codes (for signin), and other temporary items that we won't want persisted to cold storage (AWS S3).
- `minio` - This site will read/write images and files to the `images.spencerduball.com` domain which will be the public endpoint for the minio bucket.
- `nats` - When errors occur, requests finish processing, or other events such as new comments are sent to the website jobs will be sent to the work queue. When persistent connections (SSE) are made to the server for realtime updates, a subscriber connection is created listening for events to stream to clients.

### Realtime

Realtime connections between the web server and clients will be facilitated via [SSE](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events). When a request comes in that should be kept open the route will also subscribe to events from a publisher through NATS. When a new request (such as a new comment) is inserted a message will be sent to the publisher and NATS will send the message to the subscriber, which will then stream a new response to the client. When a web process creates many subscriptions to NATS topics they will all share the same connection, so there is no harm in subscribing multiple times with a route handler.

Each SSE connection will consume ~1kb - 4kb of memory at idle. Some rough estimates assuming 1GB of RAM available for connections and each connection consumes 4KB of memory:

```math
\text{Max Connections} = \frac{\text{Available RAM}}{\text{Memory per Connection}} = \frac{1 \, \text{GB}}{4 \, \text{KB}} = \frac{1,024 \times 1,024 \, \text{KB}}{4 \, \text{KB}} = 262,144
```

Each TCP connection on Linux consumes a file descriptor and the limits on linux can be configured up to hundreds of thousands of file descriptors available per process, however outgoing TCP connections use ephemeral ports. By default (on Linux) the ephemeral port range is commonly **32,768 - 65,535** providing **~28,000** outgoing ports. After tuning the host system on a single box this application could probably handle **up to 1 million** concurrent idle SSE connections, however the likelyhood of coming anywhere close to 28,000 concurrent connections for a blog is next to 0 - so the default configuration will be well past sufficient for any workload this server would need to handle.

## worker

The worker process will handle all background jobs and is meant to offload CPU-instensive tasks to prevent any blockage of the web server's event loop. Workers are pull consumers so all jobs that are taken from the NATS work queue will be retrieved when the worker is idle and ready to process jobs. These tasks will range from:

- Processing logs for analytics and metrics such as:
  - Page views
  - Geographic location of visitors
- Image processing
  - Create thumbnails for lists
  - Create different image sizes for different devices
- Etc.

The worker will read/write files to minio, update records in `/data/data.db`, send alerts/notifications, and more.
