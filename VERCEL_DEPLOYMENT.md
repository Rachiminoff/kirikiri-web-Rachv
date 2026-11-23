# Deploying to Vercel

This repository is a Create React App single-page application.

## Vercel project settings

When importing this repository into Vercel, use:

- **Framework Preset:** Create React App
- **Root Directory:** `./` when this repository is imported directly; otherwise select the directory containing this `package.json`
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Install Command:** `npm install` (or `npm ci`)

These settings are also represented in `vercel.json`.

## Routing and game assets

The Vercel rewrites are intentionally ordered:

1. `/static/...` is proxied to `https://fatestaynight.vnovel.org/static/...`.
2. All remaining paths fall back to `/index.html`, allowing React Router routes to load directly and survive refreshes.

The `proxy` entry in `package.json` is only for local Create React App development. It does not configure production hosting.

The reader loads scripts, images, music, sound effects and voice from the upstream `/static/` host. The Vercel rewrite does not copy those assets into this repository. The deployment therefore depends on the upstream host remaining available and permitting these requests. If it becomes unavailable, host the required assets somewhere you control and update the rewrite or asset paths.

## Progressive Web App (PWA)

The app is configured as an installable PWA:

- `public/manifest.json` defines the app name, standalone display mode, start URL, theme colors and install icons.
- `public/icons/` contains 192px, 512px, maskable and Apple touch icons.
- `src/index.js` registers the Create React App service worker in production.
- Vercel serves the service-worker script with revalidation headers so clients can discover deployments instead of keeping an old worker indefinitely.

The service worker precaches the generated app shell and build assets. This helps the interface load on repeat visits and allows the cached shell to open offline. It does **not** make the full visual novel available offline: the game content under `/static/` is fetched from the upstream host and still requires a network connection unless those assets are separately cached or hosted locally.

After deployment, test installation from a supported browser's install option. On iOS, use Safari's **Share → Add to Home Screen**. Service workers and installation require HTTPS, except on localhost.

## Local development

Run:

```sh
npm ci
npm start
```

The service worker is only registered in production builds, so local development continues to use the normal development server.
