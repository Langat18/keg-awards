# KSG Awards API

Laravel 13 API for the staff rewards and recognition system. Authentication uses Sanctum bearer tokens; data lives in PostgreSQL.

## Setup

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8001
```

The migrations use PostgreSQL-specific constraints (KSG email check, one running cycle at a time), so use PostgreSQL locally as well.

## Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` or `DB_*` | PostgreSQL connection |
| `FRONTEND_URL` | Web app origin allowed by CORS |
| `ADMIN_EMAIL` | Administrator created by the seeder (default `system.admin@ksg.ac.ke`) |
| `ADMIN_PASSWORD` | Password for that administrator. If empty, a random one is printed once |
| `ADMIN_SETUP_TOKEN` | Enables `GET /run-migrations/{token}`. Leave empty to disable the route |

## Commands

| Command | What it does |
|---|---|
| `php artisan admin:password [email]` | Set a new administrator password and sign out all their sessions |
| `php artisan db:seed` | Create the administrator if it does not exist yet |

## Rules enforced by the API

- Registration is limited to `firstname.lastname@ksg.ac.ke` addresses.
- Sign-in and registration are rate limited per IP and per email.
- Deactivated accounts are signed out immediately and cannot sign in.
- Accounts with nominations or votes on record can be deactivated but not deleted.
- Only one cycle can be in nominations or voting at a time, and a cycle needs at least one category before nominations open.
- Results require results access (administrators always have it) and are only available once a cycle is published. Tied nominees are all marked as winners.
- Administrator actions on cycles, nominations and accounts are written to `audit_logs`.

## Endpoints

All routes are under `/api`. Everything except sign-in and registration needs a bearer token.

| Method | Path | Who |
|---|---|---|
| POST | `/auth/login`, `/auth/register` | Anyone |
| POST | `/auth/logout` | Signed in |
| GET | `/auth/me` | Signed in |
| PATCH | `/auth/profile`, `/auth/password` | Signed in |
| GET | `/cycles/active` | Signed in |
| GET | `/cycles/active-with-results` | Results access |
| GET | `/cycles/{cycle}/categories`, `/nominations`, `/my-votes` | Signed in |
| GET | `/cycles/{cycle}/results` | Results access |
| GET | `/users` | Signed in |
| POST | `/cycles/{cycle}/nominations`, `/votes` | Signed in |
| GET, POST | `/cycles` | Admin |
| PUT, DELETE | `/cycles/{cycle}` | Admin |
| POST | `/cycles/{cycle}/phase`, `/close-nominations`, `/clone`, `/force-delete` | Admin |
| POST, PUT, DELETE | `/cycles/{cycle}/categories/{category?}` | Admin |
| DELETE | `/nominations/{nomination}` | Admin |
| GET | `/admin/users` | Admin |
| PATCH | `/admin/users/{user}/toggle`, `/toggle-results` | Admin |
| DELETE | `/admin/users/{user}` | Admin |
