# Environment: Local PostgreSQL on VPS

Use **local PostgreSQL only**. No Neon or other cloud databases.

## Required: `.env` and `.env.local` and `.env.production`

Create or update these files (replace `<PASSWORD>` with the actual password for `markano_user`):

```env
DATABASE_URL=postgresql://markano_user:<PASSWORD>@localhost:5432/markano
NODE_ENV=production
```

- **DB name:** `markano`
- **DB user:** `markano_user`
- **Host:** `localhost` (or `127.0.0.1`)
- **Port:** `5432`

On the VPS, ensure `.env` in the project root contains this `DATABASE_URL` (with the real password). The app reads `DATABASE_URL` from env and connects via the `postgres` (postgres.js) client.
