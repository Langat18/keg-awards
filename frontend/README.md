# KSG Awards — Frontend

React frontend for the Kenya School of Government staff rewards and recognition system. Staff nominate and vote on award categories across a cycle (nominations → voting → results); admins manage cycles, categories, and user access from a separate management area.

## Stack

- React 19 + Vite
- React Router
- Tailwind CSS
- Axios

## Local development

```bash
npm install
npm run dev
```

The dev server reads `VITE_API_URL` from `.env` (or `.env.local`). Point it at your local backend:

```
VITE_API_URL=http://localhost:8001/api
```

## Build

```bash
npm run build
```

Output goes to `dist/`. `VITE_API_URL` is baked into the build at this step — it is not read at runtime, so changing it requires a rebuild.

## Project structure

```
src/
  pages/
    guest/        Landing page
    staff/         Staff-facing pages (home, nominate, vote, results)
    management/    Admin-facing pages (cycles, nominations, results, users)
  components/      Shared UI components
  hooks/           Data-fetching hooks (cycle, nominations, users)
  store/           Auth context
  api/             Axios instance and interceptors
```

Staff and admin areas use separate layouts (`StaffLayout`, `ManagementLayout`) and route trees, gated by the user's role from the auth context.

## Environment variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, including the `/api` suffix |

## Deployment

Deployed to Render as a Docker web service. The Dockerfile builds the app with Vite and serves the static output with `serve`. See the root-level `render.yaml` and `DEPLOYMENT.md` for the full deployment process, including required environment variables and first-time setup steps.

## Notes

- Authentication uses Bearer tokens (Sanctum) stored in `localStorage`; the axios interceptor attaches the token to every request and redirects to `/login` on a 401.
- Results visibility is gated per-user via a `can_view_results` flag, separate from admin status — staff without explicit access do not see the Results page or card on their dashboard.