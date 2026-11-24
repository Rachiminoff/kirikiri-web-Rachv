# KiriKiri Web — Rachv

Rachv is an enhanced fork of [KiriKiri Web](https://github.com/Kent-H/kirikiri-web), a browser-based reader built for the web version of [Fate/stay night](https://fatestaynight.vnovel.org).

The fork keeps the upstream reader foundation and adds a more configurable visual-novel reading experience, browser-local progress and save tools, route-focused scene navigation, and phone-specific reading behavior.

## What Rachv adds

- **Three reading modes:** NVL, Textbox, and the original Scrolling presentation.
- **Reading controls:** Back, Auto, Skip, Log, Hide, Settings, and quick access to the scene list.
- **Reader customization:** font and text-size settings, configurable keyboard shortcuts, and dialogue-box opacity controls.
- **Backlog:** a local history of up to 400 displayed text pages, grouped by scene.
- **Resume and progress:** remembers the current reading position and records indexed scenes that have been opened.
- **Save management:** three browser-local save slots in **Settings → Progress**, plus JSON export/import for moving progress between browsers or devices.
- **Route navigation:** route selector for Fate, Unlimited Blade Works, and Heaven's Feel, day shortcuts, and an interactive scene flowchart.
- **In-game guide:** a flowchart walkthrough of every route's choices in **Settings → Guide**, with the recommended path highlighted and each bad end marked.
- **Return from Tiger Dojo:** at the end of a Tiger Dojo (bad end) scene, a button takes you back to your last choice with your flags restored.
- **Mobile reading support:** visible-height handling, optional fullscreen/landscape behavior, touch input, and a side control dock on sufficiently wide landscape phones.
- **Deployment and install metadata:** Vercel configuration, web manifest, and application icons.

For a detailed explanation, start with the [Rachv documentation](./docs/README.md), especially [What Rachv Adds](./docs/features/overview.md).

## Important limitations

- Story assets are loaded on demand from the upstream asset host. An internet connection is normally required to load scenes and their media.
- Progress is stored in the current browser. It is not automatically synchronized between devices; use JSON export/import to transfer it.
- Route progress percentages count indexed scenes visited. They are not a definitive route-completion measure.
- The reader evaluates supported conditions represented in the generated scene graph, but it does not reproduce every hidden state or the complete scripting behavior of the original game.
- PWA installation does not mean that the complete visual novel is downloaded for offline use. Offline availability depends on the service worker cache and whether the required story assets have already been cached.

## Development

You will need Node.js and npm.

### 1. Install dependencies

```bash
npm ci
```

### 2. Configure the legacy OpenSSL provider

This project uses an older Create React App and Webpack version. When running it with newer Node.js versions, the legacy OpenSSL provider may be required to avoid `ERR_OSSL_EVP_UNSUPPORTED`.

In Windows PowerShell, run:

```powershell
$env:NODE_OPTIONS="--openssl-legacy-provider"
```

### 3. Start the development server

```bash
npm start
```

Then open `http://localhost:3000`.

### 4. Create a production build

In the same PowerShell session, run:

```powershell
npm run build
```

The `NODE_OPTIONS` environment variable must be configured again whenever you open a new PowerShell session.

Story assets are loaded on demand from the upstream site, so an internet connection is required during development.

See [Development Setup](./docs/development/getting-started.md) for additional instructions, troubleshooting, tests, and the legacy OpenSSL workaround.

## Deployment

The project includes a `vercel.json` configuration. See [Vercel Deployment](./docs/deployment/vercel.md) for the recommended project settings and environment-variable guidance.

## Social

Join the [KiriKiri Web Discord](https://discord.gg/ejespgUpgg).

## Acknowledgments

Rachv is a fork of the upstream KiriKiri Web project. Please see [acknowledgments.md](./acknowledgments.md) for the project's existing acknowledgments and attribution.
