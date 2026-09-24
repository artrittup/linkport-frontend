# LinkPort Frontend

LinkPort is a professional networking and opportunities platform for members,
companies, and administrators. This repository contains its React single-page
application; the LinkPort API is maintained and run separately.

## Architecture

- React 19 with role-aware routes for candidates, companies, and administrators
- Vite 8 for development and production builds
- Tailwind CSS 4 for styling
- Axios API modules, with authentication state stored in browser local storage
- Docker development server with hot reload
- Unprivileged Nginx production server with SPA route fallback

## Requirements

- Docker with the Compose plugin
- [Task](https://taskfile.dev/) for the short commands below
- The LinkPort API running at a URL reachable by the browser

Node.js and npm are not required on the host.

## Development

Create the optional local environment file:

```bash
cp .env.example .env
```

The default API setting is:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Start the frontend:

```bash
task dev
```

Open <http://localhost:5173>. Because API requests are made by the browser,
`VITE_API_BASE_URL` must be reachable from the browser rather than only from the
frontend container.

The development container bind-mounts the source tree and stores dependencies in
a named Docker volume. Rebuilding after `package-lock.json` changes refreshes that
volume automatically.

## Common tasks

```bash
task dev          # Start Vite with hot reload
task stop         # Stop the containers
task logs         # Follow development logs
task shell        # Open a container shell
task lint         # Run ESLint
task build        # Create the Vite production bundle
task check        # Run lint and build
task prod:build   # Build the production image
task prod:run     # Run production on port 8080
task clean        # Remove this project's containers and dependency volume
```

The equivalent development command without Task is:

```bash
docker compose -f compose.yaml up --build frontend
```

## Production

The production image serves the static application on port `8080`. Set
`API_BASE_URL` when the container starts; it is injected into
`window.__LINKPORT_CONFIG__.apiBaseUrl`, so the same image can be used in
multiple environments without rebuilding.

```bash
API_BASE_URL=https://api.example.com/api task prod:run
```

To change the host port or image tag:

```bash
PROD_PORT=3000 IMAGE_TAG=release API_BASE_URL=https://api.example.com/api task prod:run
```

The production API URL resolution order is:

1. Runtime `API_BASE_URL` from the container
2. Build/development `VITE_API_BASE_URL`
3. `http://127.0.0.1:8000/api`

Useful production checks:

```bash
curl http://localhost:8080/healthz
curl http://localhost:8080/member/home
curl http://localhost:8080/runtime-config.js
```

Nginx serves direct application routes through `index.html`, caches fingerprinted
assets, and prevents caching of the HTML shell and runtime configuration.

## Troubleshooting

- If the UI opens but API calls fail, verify the configured API URL in browser
  developer tools and confirm the backend permits the frontend origin through
  CORS.
- If dependencies appear stale after a lockfile update, run `task dev` so Compose
  rebuilds the image. Use `task clean` for a complete dependency-volume reset.
- If a port is already in use, set `DEV_PORT` or `PROD_PORT`, for example
  `DEV_PORT=5174 task dev`.
- `.env` files are intentionally excluded from Git and production image builds.

There is currently no automated JavaScript test suite. Run `task check` before
committing changes, and manually verify registration, login, and navigation for
each application role against a running API.
