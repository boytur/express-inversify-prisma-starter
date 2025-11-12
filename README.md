# Express + Inversify + Prisma Starter

A production-ready Express starter that wires together Inversify for dependency injection, Prisma as the ORM, and TypeScript-first tooling. It comes with sane defaults for configuration, logging, testing, and documentation so you can start shipping features immediately.

## Highlights

- **Type-safe stack**: Express, TypeScript, Inversify, Prisma, Zod validation, and JWT auth helpers.
- **Pragmatic DX**: Nodemon-like hot reload via `ts-node-dev`, Jest unit tests, path aliases, and typed configuration parsing.
- **Production touches**: Graceful shutdown, structured logging with optional remote shipping, health checks, Docker multi-stage build, and Postgres docker-compose file.
- **API documentation**: Swagger (OpenAPI 3) docs exposed at `/api-docs` in non-production environments.

## Prerequisites

- Node.js 18+
- npm (comes with Node)
- PostgreSQL database (local Docker Compose recipe provided)

## Getting Started

1. **Install dependencies**
	```bash
	npm install
	```
2. **Provision a database (optional but recommended)**
	```bash
	docker compose up -d
	```
3. **Create your environment file**
	```bash
	cp .env.example .env
	# update DATABASE_URL and JWT_SECRET at minimum
	```
4. **Run Prisma migrations**
	```bash
	npx prisma migrate dev
	```
5. **Start the app in watch mode**
	```bash
	npm run dev
	```
	The server listens on `http://localhost:3000` by default. Adjust `PORT` in `.env` if needed.

## NPM Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Express with hot-reload (`ts-node-dev`). |
| `npm run build` | Compile TypeScript to `dist/` and rewrite path aliases (`tsc` + `tsc-alias`). |
| `npm run start:prod` | Run the compiled server from `dist/server.js`. |
| `npm run test` | Execute Jest unit tests with coverage. |
| `npm run docker:build` | Build the production Docker image defined in `Dockerfile`. |

## Prisma Toolkit

- Generate client after schema changes: `npx prisma generate`
- Create & apply new migration: `npx prisma migrate dev --name <migration-name>`
- Reset local database (destructive): `npx prisma migrate reset`

The Prisma client is wrapped in `src/prisma/prisma.service.ts` and injected via Inversify so repositories stay testable.

## API Surface

- Health probe: `GET /health`
- User module (`src/modules/user`)
  - `POST /api/users/register`
  - `POST /api/users/login`

Swagger UI (`/api-docs`) and the raw spec (`/swagger.json`) are registered automatically when `NODE_ENV !== "production"`.

## Configuration

Configuration comes from environment variables validated by Zod (see `src/config/index.ts`). Required variables:

- `JWT_SECRET` – secret used to sign authentication tokens.

Optional variables:

- `PORT` (`3000` default)
- `NODE_ENV` (`development`, `test`, `production`)
- `DATABASE_URL` – PostgreSQL connection string used by Prisma.
- `LOG_LEVEL` – Pino log level (`info`, `debug`, etc.).
- `LOG_ENDPOINT` – HTTPS endpoint to forward JSON logs (non-blocking).

## Logging & Observability

- Access logs via `src/middleware/request.logger.ts`.
- Application logging centralised in `src/utils/logger.ts` (Pino-based).
- Graceful shutdown in `src/server.ts` handles SIGINT/SIGTERM, HTTP server close, and Prisma disconnect.

## Testing

Run all tests with coverage:

```bash
npm run test
```

Jest is configured in `jest.config.js` with TypeScript support and module path aliases.

## Project Layout

```
src/
  app.ts                 # Express bootstrap when not using inversify-express-utils
  server.ts              # Primary entry point with DI container
  inversify.config.ts    # Inversify bindings
  modules/user/          # Example feature module (controller, service, repository)
  middleware/            # Request logger, Auth, error handling
  prisma/                # Prisma service wrapper
  services/              # Shared services (crypto utilities)
  docs/                  # Swagger wiring and components
public/                  # Static assets (served from Express)
prisma/
  schema.prisma          # Prisma data model
  migrations/            # Auto-generated SQL migrations
compose.yaml             # Local Postgres container
Dockerfile               # Multi-stage production image
```

## Container Image

Build the production image locally:

```bash
npm run docker:build
```

The `Dockerfile` uses Node 18 Alpine images and copies only the compiled `dist/` bundle plus production dependencies.

## CI/CD

A ready-to-use GitHub Actions workflow (`.github/workflows/ci.yml`) runs linting, build, and tests. Extend it with deploy steps as needed.

## Next Steps

- Add more modules by following the `modules/user` pattern (controller + service + repository + schema).
- Wire additional middlewares (rate limiting, tracing, etc.) in `server.ts` or `app.ts`.
- Plug the logger into a central platform by pointing `LOG_ENDPOINT` at your collector.
