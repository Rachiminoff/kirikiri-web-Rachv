# Deploying to Vercel

The repository includes a `vercel.json` file for deploying the Create React App frontend.

## Project settings

When importing the repository into Vercel, use these settings:

| Setting | Value |
| --- | --- |
| Framework preset | Create React App (or Other if Vercel does not detect it) |
| Root directory | `./` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `build` |

The Vercel configuration also includes the project's rewrite and response-header rules. Keep `vercel.json` in the repository root.

## Node.js OpenSSL compatibility

If the build log reports `ERR_OSSL_EVP_UNSUPPORTED`, the older build toolchain may need the legacy OpenSSL provider. Add this environment variable in the Vercel project settings:

| Name | Value |
| --- | --- |
| `NODE_OPTIONS` | `--openssl-legacy-provider` |

Apply it to the deployment environments you use, then redeploy. This workaround should be removed after the build toolchain has been upgraded and verified with a production build.

## Frontend and story assets are separate

Deploying this repository to Vercel hosts the frontend application. The story's scripts, images, music, voice, and sound effects are still requested from the upstream asset host configured by the project. The deployment does not copy those assets into the Vercel project.

## PWA notes

The project includes a web manifest, app icons, and a service-worker entry point. These allow supported browsers to treat the site as an installable web app and cache resources according to the service worker's rules. They do not guarantee that every story asset will be available offline. Test installation and update behavior on the deployed HTTPS site.
