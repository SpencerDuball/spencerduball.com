# Welcome to Remix + Vite!

📖 See the [Remix docs](https://remix.run/docs) and the [Remix Vite docs](https://remix.run/docs/en/main/future/vite) for details on supported features.

## Development

Run the Vite dev server:

```shellscript
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

---

```bash
# build for staging
docker build -t staging .

# run for staging
docker run -p 8080:8080 staging
```

# Creating the App

You may need to destroy the app (stage or prod) and the way to create and deploy it is as follows:

```bash
# create the app
flyctl apps create spencerduballcom-stage 

# deploy the app
flyctl deploy -c fly.stage.toml
```