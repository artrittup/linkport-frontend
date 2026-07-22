# LinkPort Frontend

LinkPort is a professional networking and opportunities platform for members and companies. This directory contains the React single-page application.

## Stack

- React
- Vite
- Tailwind CSS

## Requirements

- Node.js
- npm
- The LinkPort API running at `http://127.0.0.1:8000`

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file from `.env.example`:

   ```powershell
   Copy-Item .env.example .env
   ```

   On macOS or Linux, use `cp .env.example .env`.

3. Confirm `.env` contains:

   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000/api
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

Open the frontend at [http://localhost:5173](http://localhost:5173). The backend must remain available at `http://127.0.0.1:8000` while using the app.

## Common commands

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Testing checklist

- Confirm the API health check responds at `http://127.0.0.1:8000/api/health`.
- Open the landing page and test registration and login.
- Verify member, company, and admin navigation with the appropriate account.
- Run `npm run lint` and `npm run build` before committing frontend changes.

Do not commit `.env`; it is intended for local configuration only.
