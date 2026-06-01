# CMS Implementation Documentation

## Overview
The CMS is a two-part system:
- A Laravel backend in `hahu-back/cms` that stores content packs, pack versions, authentication, and admin-only APIs.
- A Next.js admin app in `admin-app` that lets an admin manage packs and versions from the browser.

The CMS is designed for a mobile/content-delivery workflow:
- Public clients fetch active packs and manifests.
- Admins create, update, and delete packs and versions.
- All admin actions require a Bearer token and admin role checks.

## What It Does
### Public side
- Lists active packs with their latest published version.
- Serves a manifest for a given pack slug.
- Serves the version payload for a pack download request.

### Admin side
- Lists all packs.
- Creates, edits, and deletes packs.
- Lists all versions.
- Creates and deletes versions.
- Keeps the admin token stored in the browser so it is not lost when moving between pages.

## Architecture
### Backend
- Framework: Laravel 12
- Auth: Sanctum tokens
- RBAC: `role = admin` plus `AdminMiddleware`
- Main models:
  - `User`
  - `ContentPack`
  - `ContentPackVersion`

### Frontend
- Framework: Next.js App Router
- Language: TypeScript
- Admin UI pages:
  - `/packs`
  - `/packs/create`
  - `/packs/[id]/edit`
  - `/packs/[id]/versions`
- Token storage:
  - Browser `localStorage`
  - Key: `cms_admin_token`

## Security Model
### Login
Admins log in through the backend and receive a Sanctum Bearer token.

### Admin access
Every admin route requires:
- `Authorization: Bearer <token>`
- A valid Sanctum session/token
- A user with `role = admin`

### Browser behavior
The admin app does not try to hide or replace the token. It asks for the token explicitly and stores it locally so the token survives page navigation and refreshes.

## API Surface
All API routes are under `/api`.

### Authentication
#### POST `/api/auth/login`
Logs a user in and returns a token.

Input:
```json
{
  "email": "admin@example.com",
  "password": "adminpassword"
}
```

Output:
```json
{
  "token": "1|plain-text-sanctum-token",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### POST `/api/auth/logout`
Requires auth.

Output:
```json
{
  "message": "Logged out"
}
```

#### GET `/api/auth/user`
Requires auth.

Output:
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin"
}
```

### Public content endpoints
#### GET `/api/content/packs`
Returns active packs with their latest published version.

Output:
```json
{
  "contentPacks": [
    {
      "id": "animals-pack",
      "title": "Animals Pack",
      "description": "A pack of animal content",
      "gameType": "quiz",
      "thumbnail": "https://...",
      "size": 12.5,
      "version": "1.0.0",
      "checksum": "abc123",
      "sizeBytes": 123456,
      "minAppVersion": "1.0.0",
      "manifestUrl": "http://localhost:8000/api/content/packs/animals-pack/manifest",
      "downloadUrl": "http://localhost:8000/api/content/packs/animals-pack/download"
    }
  ]
}
```

#### GET `/api/content/packs/{slug}/manifest`
Returns the pack manifest.

Output:
```json
{
  "id": "animals-pack",
  "title": "Animals Pack",
  "description": "A pack of animal content",
  "gameType": "quiz",
  "thumbnail": "https://...",
  "version": "1.0.0",
  "checksum": "abc123",
  "sizeBytes": 123456,
  "minAppVersion": "1.0.0",
  "publishedAt": "2026-05-09T00:00:00.000000Z",
  "downloadUrl": "http://localhost:8000/api/content/packs/animals-pack/download"
}
```

#### GET `/api/content/packs/{slug}/download`
Returns the JSON payload for the latest published version.

Example output:
```json
{
  "items": [
    {
      "id": 1,
      "name": "Lion",
      "image": "https://..."
    }
  ]
}
```

### Admin content pack endpoints
All admin pack routes require `auth:sanctum` and `admin` middleware.

#### GET `/api/admin/content-packs`
Lists all packs for the admin UI.

The CMS now treats these game_type values as canonical across the admin UI and backend:
- `Fidel Tracing`
- `Fidel Match`
- `Pic-to-Word`
- `Word Builder`
- `Listen & Fill`
- `Speak Up`
- `Story Quiz`

Output:
```json
[
  {
    "id": 1,
    "slug": "animals-pack",
    "title": "Animals Pack",
    "description": "A pack of animal content",
    "game_type": "Story Quiz",
    "thumbnail_url": "https://...",
    "size_mb": 12.5,
    "is_active": true,
    "versions_count": 2,
    "latest_published_version": {
      "id": 7,
      "version": "1.0.0",
      "published_at": "2026-05-09T00:00:00.000000Z"
    }
  }
]
```

#### GET `/api/admin/content-packs/{id}`
Returns a single pack for editing.

Output:
```json
{
  "id": 1,
  "slug": "animals-pack",
  "title": "Animals Pack",
  "description": "A pack of animal content",
  "game_type": "Story Quiz",
  "thumbnail_url": "https://...",
  "size_mb": 12.5,
  "is_active": true,
  "latest_published_version": {
    "id": 7,
    "version": "1.0.0",
    "published_at": "2026-05-09T00:00:00.000000Z"
  }
}
```

#### POST `/api/admin/content-packs`
Creates a new pack.

Input:
```json
{
  "slug": "animals-pack",
  "title": "Animals Pack",
  "description": "A pack of animal content",
  "game_type": "Story Quiz",
  "thumbnail_url": "https://...",
  "size_mb": 12.5,
  "is_active": true
}
```

Output:
```json
{
  "id": 1,
  "slug": "animals-pack",
  "title": "Animals Pack",
  "description": "A pack of animal content",
  "game_type": "Story Quiz",
  "thumbnail_url": "https://...",
  "size_mb": 12.5,
  "is_active": true
}
```

#### PUT `/api/admin/content-packs/{id}`
Updates an existing pack.
Input:
```json
{
  "title": "Updated Animals Pack",
  "description": "Updated description",
  "game_type": "Story Quiz",
  "thumbnail_url": "https://...",
  "size_mb": 13,
  "is_active": true
}
```

Output:
```json
{
  "id": 1,
  "slug": "animals-pack",
  "title": "Updated Animals Pack",
  "description": "Updated description",
  "game_type": "Story Quiz",
  "thumbnail_url": "https://...",
  "size_mb": 13,
  "is_active": true
}
```

#### DELETE `/api/admin/content-packs/{id}`
Deletes a pack.

Output:
```json
{
  "message": "Content pack deleted"
}
```

### Admin version endpoints
#### GET `/api/admin/content-pack-versions`
Returns all versions, optionally filtered by `content_pack_id`.

Example query:
- `/api/admin/content-pack-versions?content_pack_id=1`

Output:
```json
[
  {
    "id": 7,
    "content_pack_id": 1,
    "version": "1.0.0",
    "checksum": "abc123",
    "size_bytes": 123456,
    "payload": {
      "items": []
    },
    "min_app_version": "1.0.0",
    "published_at": "2026-05-09T00:00:00.000000Z"
      "game_type": "Story Quiz",
]
```

#### POST `/api/admin/content-pack-versions`
Creates a version.

Input:
```json
{
  "content_pack_id": 1,
  "version": "1.0.1",
  "payload": {
    "items": [
      {
        "id": 1,
        "name": "Lion",
        "image": "https://..."
      }
    ]
  },
  "checksum": "def456",
  "size_bytes": 234567,
  "min_app_version": "1.0.0",
  "published_at": "2026-05-09"
}
```

Output:
```json
{
  "id": 8,
  "content_pack_id": 1,
  "version": "1.0.1",
  "checksum": "def456",
  "size_bytes": 234567,
  "payload": {
    "items": []
  },
  "min_app_version": "1.0.0",
  "published_at": "2026-05-09T00:00:00.000000Z"
}
```

#### PUT `/api/admin/content-pack-versions/{id}`
Updates a version.

Input:
```json
{
  "checksum": "updated-checksum",
  "size_bytes": 345678,
  "payload": {
    "items": []
  },
  "min_app_version": "1.0.1",
  "published_at": "2026-05-10"
}
```

#### DELETE `/api/admin/content-pack-versions/{id}`
Deletes a version.

Output:
```json
{
  "message": "Content pack version deleted"
}
```

## Validation Rules
### Content pack create/update
- `slug`: required on create, unique, string
- `title`: required, string
- `description`: optional, string
- `game_type`: optional, string, should match one of the canonical CMS game types listed above
- `thumbnail_url`: optional, string
- `size_mb`: optional, numeric
- `is_active`: optional, boolean

### Version create/update
- `content_pack_id`: required on create, must reference an existing pack
- `version`: required string, usually semantic version such as `1.0.0`
- `checksum`: required string
- `size_bytes`: required integer
- `payload`: required JSON object/array
- `min_app_version`: required string
- `published_at`: optional date

## Admin UI
### How to view it
1. Open the `admin-app` folder.
2. Install dependencies if needed.
3. Start the dev server.
4. Open the browser at `http://localhost:3000`.
5. If `localhost` is not reachable from your environment, start Next.js with `--hostname 0.0.0.0` and open the forwarded port in the browser.

### Pages
- `/packs`: list packs, delete packs, open edit/version pages.
- `/packs/create`: create a new pack.
- `/packs/[id]/edit`: edit a pack.
- `/packs/[id]/versions`: list/create/delete versions for one pack.

### Token behavior
- Each page reads the token from localStorage.
- If the token is missing, the page prompts for it.
- Once entered, the token stays available across refreshes and page transitions.

## Testing Guide
### Backend checks
Run these from `hahu-back/cms` after dependencies are installed:
- `php artisan route:list`
- `php artisan test`
- `php artisan serve --host=0.0.0.0 --port=8000`

### Frontend checks
Run these from `admin-app`:
- `npm run dev -- --hostname 0.0.0.0`
- `npm run build`
- `npm run lint`

### API smoke tests
You can test the CMS manually with curl or Postman.

Example login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"adminpassword\"}"
```

Example admin list:
```bash
curl http://localhost:8000/api/admin/content-packs \
  -H "Authorization: Bearer <token>"
```

Example public pack list:
```bash
curl http://localhost:8000/api/content/packs
```

## Notes
- The backend and admin UI now use matching route prefixes and response shapes.
- The admin token is intentionally user-managed and stored locally in the browser.
- If you change the API response shape, update `admin-app/lib/cmsApi.ts` and this document together.
