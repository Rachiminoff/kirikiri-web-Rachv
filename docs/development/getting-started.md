# Development Setup

Rachv uses Create React App (`react-scripts`) and the dependency versions declared in `package.json` and `package-lock.json`.

## Requirements

- Node.js and npm installed.
- An internet connection. Story assets are loaded on demand from the upstream asset host.

## Install and run

From the repository root:

```bash
npm ci
npm start
```

Open `http://localhost:3000` in your browser. The development server reloads the page when source files change.

## Build for production

```bash
npm run build
```

The production files are written to the `build/` directory.

### OpenSSL compatibility on newer Node.js versions

This repository uses an older Create React App/Webpack toolchain. With some newer Node.js versions, the production build may fail with `ERR_OSSL_EVP_UNSUPPORTED`. In PowerShell, the compatibility workaround is:

```powershell
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm run build
```

For a temporary setting in a Unix-like shell:

```bash
NODE_OPTIONS=--openssl-legacy-provider npm run build
```

This is a compatibility workaround, not a long-term dependency upgrade. Do not assume it is required on every Node.js version. A future toolchain upgrade should aim to remove the need for the legacy provider.

## Tests

Run the existing test suite with:

```bash
npm test
```

The test runner is interactive by default. Follow the prompts shown in the terminal.

## Asset loading

The `proxy` setting in `package.json` points the development server at the upstream site. Story assets are requested on demand, so the reader needs network access even when the frontend is running locally.
