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

## Architecture Overview

- Express is bootstrapped through `InversifyExpressServer`, allowing controllers to declare dependencies via decorators.
- Services and repositories are composed through the DI container defined in `src/inversify.config.ts`.
- Prisma acts as the data access layer, exposed through `PrismaService` so the raw client stays isolated from feature modules.
- Zod schemas enforce request payload contracts before they reach business logic, keeping controllers thin.
- Cross-cutting concerns (logging, auth, error handling) live in `src/middleware` and are registered centrally.

### Request Lifecycle

1. Incoming HTTP request hits Express.
2. Global middlewares apply (JSON parsing, `requestLogger`, CORS, static assets).
3. Inversify routes the request to the controller matching the path.
4. Validation middleware (`validate`) checks DTOs; failures short-circuit with `400` responses.
5. Controller resolves the required service from the container and invokes domain logic.
6. Service interacts with repositories which call Prisma.
7. Responses propagate back through the middleware stack; errors flow to `errorMiddleware`.

## Container Image

Build the production image locally:

```bash
npm run docker:build
```

The `Dockerfile` uses Node 18 Alpine images and copies only the compiled `dist/` bundle plus production dependencies.

## Extending the Template

- **Add a module**: create a folder in `src/modules/<feature>` containing controller, DTO/schema, service, repository. Register bindings in `src/inversify.config.ts` and export `@controller`-decorated classes.
- **Add middleware**: drop a new file under `src/middleware` and register it in `server.ts` before controllers are mounted.
- **Add database tables**: update `prisma/schema.prisma`, run `npx prisma migrate dev`, and expose the model through repositories.
- **Document a route**: add OpenAPI annotations (JSDoc style) on controller methods so `swagger-jsdoc` picks them up automatically.

## CI/CD

A ready-to-use GitHub Actions workflow (`.github/workflows/ci.yml`) runs linting, build, and tests. Extend it with deploy steps as needed.

## Troubleshooting

- **Prisma cannot reach the database**: confirm `DATABASE_URL` points to an accessible Postgres instance and that migrations ran successfully.
- **`Cannot find module '@/...'`**: ensure `npm run build` executed after adding new aliased paths and that Jest uses `ts-jest` with the configured mapper.
- **Swagger missing in production**: by design, Swagger mounts only when `NODE_ENV !== 'production'`. Override the condition in `server.ts` if you need docs in production.
- **Log forwarding failures**: check network access to `LOG_ENDPOINT` and inspect application logs for warn/error entries from `logger`.

## FAQ

- **Why both `app.ts` and `server.ts`?** `app.ts` demonstrates a plain Express setup, while `server.ts` is the DI-enabled entry point used in production builds.
- **Can I swap Postgres for another database?** Prisma supports multiple providers. Update `prisma/schema.prisma`, adjust `DATABASE_URL`, and regenerate the client.
- **How do I seed data?** Create `prisma/seed.ts` and configure `package.json` scripts (`prisma db seed`) following Prisma docs.
- **Where do auth guards go?** Implement middleware (e.g., `AuthMiddleware`) and apply it via `@httpGet` decorator options or globally in `server.ts`.

## Next Steps

- Add more modules by following the `modules/user` pattern (controller + service + repository + schema).
- Wire additional middlewares (rate limiting, tracing, etc.) in `server.ts` or `app.ts`.
- Plug the logger into a central platform by pointing `LOG_ENDPOINT` at your collector.
