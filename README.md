# KSG Staff Rewards and Recognition

Staff awards system for the Kenya School of Government, Mombasa Campus. Staff nominate colleagues, vote in each award category and see the winners. Administrators run the awards cycles, manage categories, review nominations and control who can see results.

| Part | Stack | Folder |
|---|---|---|
| API | Laravel 13, Sanctum, PostgreSQL | [`backend/`](backend/README.md) |
| Web app | React 18, Vite, Tailwind CSS | [`frontend/`](frontend/README.md) |

Both are deployed to Render as Docker services, described in `render.yaml`.

## How a cycle works

1. An administrator creates a cycle and adds its award categories.
2. **Nominations**: staff nominate colleagues (or themselves) in any category.
3. **Voting**: one vote per person per category. A vote can be changed until voting closes.
4. **Results**: winners are calculated automatically. Ties produce joint winners.

Only one cycle can be in nominations or voting at a time. Results are visible to administrators and to staff an administrator has given results access.

## Running locally

```bash
# API on http://localhost:8001
cd backend
cp .env.example .env        # set the DB_* values for your PostgreSQL database
composer install
php artisan key:generate
php artisan migrate --seed  # prints the generated admin password once
php artisan serve --port=8001

# Web app on http://localhost:5173
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Administrator account

The seeder creates `system.admin@ksg.ac.ke`. Set `ADMIN_PASSWORD` before seeding to choose the password, otherwise a random one is generated and printed once.

To change the password later, sign in and use **Profile and password**, or run this on the server:

```bash
php artisan admin:password
```

The command asks for the new password, re-enables the account and signs out every existing session.
