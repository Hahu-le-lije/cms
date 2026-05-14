# Admin App

This is the CMS admin frontend for managing content packs and pack versions. It is built with Next.js, TypeScript, and Tailwind CSS, and it talks to the Laravel CMS backend through authenticated API requests.

## What it does

- Lists content packs.
- Creates, edits, and deletes packs.
- Manages pack versions.
- Persists the admin bearer token in local storage so the session survives refreshes.

## Requirements

- Node.js 20.x.
- The Laravel CMS backend running locally.
- A valid Laravel Sanctum bearer token for admin access.

## Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The `dev` script uses `scripts/dev.sh`, which is set up to run the app with the expected Node version on this machine.

Open the app in the browser:

```text
http://localhost:3000
```

## Admin access

When the app opens, it prompts for the admin bearer token. Paste the token once and it will be stored in the browser under the admin token key used by the app.

If you need a fresh token, create one from the Laravel CMS backend auth flow and paste it into the admin login screen.

## Main routes

- `/` - app entry point.
- `/packs` - pack list and delete actions.
- `/packs/create` - create a new pack.
- `/packs/[id]/edit` - edit an existing pack.
- `/packs/[id]/versions` - manage versions for a pack.

## Backend dependency

The frontend expects the CMS backend API to be available and reachable from the configured CMS API base URL. If requests fail, first confirm that the backend is running and that the token is valid.

## Scripts

- `npm run dev` - start the development server.
- `npm run build` - build the production app.
- `npm run start` - run the production build.
- `npm run lint` - run ESLint.

## Notes

- The admin token is stored in the browser so you do not need to re-enter it on every refresh.
- The UI is centered around content pack management, so the packs routes are the main workflow surface.
