# KSG Awards — Backend

API service for the Kenya School of Government Rewards and Recognition platform. The service manages award cycles, categories, nominations, voting, results computation, and staff account administration.

## Overview

The application implements a four-phase award cycle (`closed → nominating → voting → results`), during which staff may nominate themselves or colleagues against defined categories and criteria, cast one vote per category, and view published results once a cycle concludes. Administrative functions — cycle management, category configuration, nomination moderation, and results access control — are restricted to users with the `admin` role.

## Technology

| Component | Detail |
|---|---|
| Language / Framework | PHP 8.4, Laravel 13 |
| Database | PostgreSQL |
| Authentication | Laravel Sanctum (Bearer token) |
| Container runtime | `tangramor/nginx-php8-fpm` (nginx and php-fpm in a single image) |
| Hosting | Render (Docker web service, managed Postgres) |

## Local environment setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Configure the local database connection in `.env`:

```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ksg_awards
DB_USERNAME=postgres
DB_PASSWORD=
```

## Application structure

```
app/
  Http/Controllers/Api/   Cycle, Category, Nomination, Vote, Result, and User controllers
  Models/                  Cycle, Category, Nomination, Vote, User, AuditLog
  Http/Middleware/         Role-based access middleware
routes/
  api.php                  Application routes, authenticated via Sanctum
  web.php                  Health check route and maintenance utilities
```

## Access control

Access is governed by a `role` column on the `users` table (`admin` or staff), rather than a boolean flag. Results visibility is controlled independently via a `can_view_results` attribute, allowing specific staff members to be granted access to results without being granted administrative privileges. All administrative endpoints are protected by an `admin` middleware that verifies `role === 'admin'`.

## Domain rules

- Categories may only be created or modified while a cycle is in the `closed` phase.
- A nominee may receive nominations from multiple staff members within the same category; this is by design, and results are aggregated by nominee rather than by individual nomination record.
- Staff are permitted to nominate and vote for themselves.

## Deployment

The service is deployed to Render as a Docker web service against a managed PostgreSQL instance. Provisioning is defined in the repository root `render.yaml`; full setup instructions are documented in `DEPLOYMENT.md`.

The following operational details are specific to the current hosting configuration and should be preserved by anyone maintaining this service:

**Build-time dependency installation.** Composer dependencies are installed during the Docker build rather than via a runtime deployment hook. The base image does not provide a script-execution mechanism comparable to `RUN_SCRIPTS` in other PHP-FPM images of this type.

**Database connection resolution.** The `pgsql` connection in `config/database.php` resolves its connection string via:

```php
'url' => env('DB_URL', env('DATABASE_URL')),
```

Render's managed PostgreSQL service exposes its connection string as `DATABASE_URL`, while the Laravel application skeleton's default configuration expects `DB_URL`. This fallback reconciles the two and should not be removed.

**Migrations are not executed automatically on deploy.** The base image rejects direct invocation of the `php` binary from custom startup scripts, which precludes the conventional entrypoint-script pattern for running migrations on container start. Migrations are instead triggered on demand via an authenticated route in `routes/web.php`, which invokes the migrator from within the running application process:

```
GET /run-migrations/{token}
```

This route requires the `ADMIN_SETUP_TOKEN` environment variable and should be called once after any deployment that introduces new migrations.

## Environment variables

| Variable | Purpose |
|---|---|
| `APP_KEY` | Laravel application encryption key |
| `APP_URL` | Public URL of this service |
| `FRONTEND_URL` | Public URL of the frontend, used for CORS configuration |
| `SANCTUM_STATEFUL_DOMAINS` | Frontend domain (without protocol), required by Sanctum |
| `DATABASE_URL` | PostgreSQL connection string, provided automatically by Render |
| `ADMIN_SETUP_TOKEN` | Authorization token for the migration-trigger route |