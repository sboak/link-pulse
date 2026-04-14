# Link Pulse ⚡

A URL shortener with click analytics, built to explore Railway's multi-service deployment.

## Architecture

| Service | Description |
|---------|-------------|
| **api** | Express server — REST API + React frontend + short-link redirects |
| **cron-worker** | Periodic job — aggregates raw click data into hourly/daily rollups |
| **PostgreSQL** | Primary database (Railway managed) |
| **Redis** | URL lookup cache (Railway managed) |

## Project Structure

```
services/
├── api/              # Express API + Vite/React frontend
│   ├── src/          # API source (TypeScript)
│   ├── web/          # Frontend source (React + Tailwind)
│   └── Dockerfile
└── cron-worker/      # Click aggregation cron job
    ├── src/
    └── Dockerfile
```

## Local Development

### Prerequisites

- Node.js 22+
- PostgreSQL (local or Docker)
- Redis (optional, local or Docker)

### Setup

```bash
# API service
cd services/api
npm install
cd web && npm install && cd ..

# Set up env
cp .env.example .env   # edit DATABASE_URL and REDIS_URL

# Push schema to local DB
npx prisma db push --schema=src/prisma/schema.prisma

# Run API + frontend in dev mode
npm run dev
# In another terminal:
cd web && npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | No | Redis connection string (caching is skipped if absent) |
| `PORT` | No | API port (default: 3000) |

## Deploy to Railway

1. Create a project on [railway.app](https://railway.app)
2. Add **PostgreSQL** and **Redis** from database templates
3. Create two services from this repo:
   - **api** — root directory: `services/api`
   - **cron-worker** — root directory: `services/cron-worker`
4. Wire `DATABASE_URL` and `REDIS_URL` via Railway's reference variables
5. Set cron schedule on cron-worker: `*/5 * * * *`
6. Generate a public domain on the api service
