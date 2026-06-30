# KSG Awards — Frontend

Staff-facing web application for the Kenya School of Government Rewards and Recognition platform. Staff nominate colleagues, cast votes on award categories, and view published results. Administrators manage cycles, categories, nominations, and user access from a dedicated management area.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [User Areas](#user-areas)
- [Docker Deployment (Recommended)](#docker-deployment-recommended)
- [Local Development](#local-development)
- [Deploying Updates](#deploying-updates)
- [Environment Variables](#environment-variables)
- [Security Checklist](#security-checklist)
- [Support](#support)

---

## Tech Stack

| Component | Technology |
|---|---|
| Framework | React 19, Vite |
| Styling | Tailwind CSS |
| HTTP | Axios |
| Routing | React Router |
| Hosting | Render (Docker web service) |
| Container | Docker (`node:20-alpine` + `serve`) |

---

## Directory Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js             Axios instance with auth interceptors
│   ├── components/              Shared UI components (Card, Badge, Toast, Skeleton, etc.)
│   ├── hooks/                   Data-fetching hooks (useCycle, useNominations, useUsers)
│   ├── pages/
│   │   ├── guest/               Landing page
│   │   ├── staff/               Staff area (Home, Nominate, Vote, Results, Profile)
│   │   └── management/          Admin area (Overview, Cycles, Nominations, Results, Users)
│   └── store/
│       └── AuthContext.jsx       Authentication context and session state
├── public/                      Static assets (KSG logo, favicon)
├── .env.example                 Environment variable template
├── .env                         Local environment config (never commit)
└── Dockerfile                   Multi-stage build image (Vite build + static serve)
```

---

## User Areas

| Area | Path | Access |
|---|---|---|
| Landing | `/` | Public |
| Staff Home | `/staff` | Authenticated staff |
| Nominate | `/staff/nominate` | Authenticated staff (nominating phase only) |
| Vote | `/staff/vote` | Authenticated staff (voting phase only) |
| Results | `/staff/results` | Staff with `can_view_results` flag or admin |
| Admin Overview | `/management` | Admin only |
| Manage Cycles | `/management/cycles` | Admin only |
| Manage Nominations | `/management/nominations` | Admin only |
| Manage Results | `/management/results` | Admin only |
| Manage Users | `/management/users` | Admin only |

---

## Docker Deployment (Recommended)

This service is hosted on Render using Docker. To run it locally with Docker:

### Prerequisites

- Docker Engine

### 1 — Clone the Repository

```bash
git clone https://github.com/Langat18/keg-awards.git
cd keg-awards/frontend
```

### 2 — Configure Environment

```bash
cp .env.example .env
```

Open `.env` and set the following:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Full URL of the backend API, including the `/api` suffix |

`VITE_API_URL` is baked into the JavaScript bundle at build time. Changing it requires a full rebuild.

Never commit `.env` to Git. It is already listed in `.gitignore`.

### 3 — Build the Image

```bash
docker build \
  --build-arg VITE_API_URL=http://localhost:8001/api \
  -t ksg-awards-frontend .
```

### 4 — Run the Container

```bash
docker run -p 5173:10000 ksg-awards-frontend
```

The application will be available at `http://localhost:5173`.

---

## Local Development

```bash
npm install
npm run dev
```

Create a `.env.local` file with:

```
VITE_API_URL=http://localhost:8001/api
```

The Vite dev server reads this automatically. No build step is required during development.

---

## Deploying Updates

On Render, pushing to the connected branch triggers an automatic rebuild. Since `VITE_API_URL` is baked in at build time, Render will pass the stored environment variable as a Docker build argument during each new build — no manual intervention required unless the backend URL changes.

For local Docker deployments, rebuild the image explicitly:

```bash
docker build \
  --build-arg VITE_API_URL=https://your-backend-url.onrender.com/api \
  -t ksg-awards-frontend .
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, including the `/api` suffix. Baked into the bundle at build time. |

---

## Security Checklist

- [ ] `.env` not committed to Git
- [ ] `VITE_API_URL` points to the correct backend in each environment
- [ ] HTTPS configured on the hosted service
- [ ] Backend CORS is restricted to this frontend's URL only

---