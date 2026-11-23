# Deploying to Vercel

This repository is a Create React App single-page application.

## Vercel project settings

When importing this repository into Vercel, use:

- **Framework Preset:** Create React App
- **Root Directory:** `kirikiri-web-master` if this folder is inside a larger Git repository; otherwise `./`
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Install Command:** `npm install`

The included `vercel.json` configures the build output and two rewrite rules:

1. `/static/...` requests are proxied to `https://fatestaynight.vnovel.org/static/...`.
   The original project used the same host as its Create React App development proxy.
   CRA's `package.json` `proxy` setting only applies to local development and is not
   applied to production hosting.
2. Other paths fall back to `/index.html`, so React Router routes can be opened or
   refreshed directly without returning a Vercel 404.

## Deploy

1. Push the contents of this project folder to GitHub.
2. In Vercel, choose **Add New → Project** and import the GitHub repository.
3. Confirm the settings above and deploy.
4. Open the deployed site and test the home page, a deep-linked route, and game assets.

## Important: external game assets

The reader loads scripts, images, and music from `/static/...`. The Vercel rewrite forwards
those requests to `fatestaynight.vnovel.org`; it does not copy those assets into this
repository. The deployment therefore depends on that upstream host continuing to serve
those files and permit proxying. If that host changes, becomes unavailable, or does not
permit these requests, the reader's game content may fail to load. In that case, host the
required static assets in storage/CDN you control and update the rewrite or asset paths.

## Local development

Run `npm install` and `npm start` as before. The existing `proxy` entry in `package.json`
is retained for local development; Vercel uses `vercel.json` in production.
