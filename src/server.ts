import 'dotenv/config';
import container from '@/inversify.config';
import { TYPES } from '@/types/types';
import { PrismaService } from '@/prisma/prisma.service';
import { logger } from '@/utils/logger';
import { getConfig } from '@/config';
import express from 'express';
import swaggerDocs from '@/docs/swagger';
import { requestLogger } from '@/middleware/request.logger';
import { errorMiddleware } from '@/middleware/error.middleware';
import { InversifyExpressServer } from 'inversify-express-utils';

const port = getConfig().PORT;

async function main() {
	// create server from inversify-express-utils
	const serverBuilder = new InversifyExpressServer(container);

		const cfg = getConfig();

		serverBuilder.setConfig((app: express.Application) => {
		app.use(express.json());
		app.use(express.urlencoded({ extended: true }));
		app.use(requestLogger);
		app.use(express.static('public'));
		app.use(express.Router());
		app.use((req, _res, next) => {
			// attach simple request id or other per-request ctx here in future
			next();
		});
			// Register swagger only for non-production environments
			if (cfg.NODE_ENV !== 'production') {
				swaggerDocs(app);
			}
	});

		serverBuilder.setErrorConfig((app: express.Application) => {
			app.use(errorMiddleware);
		});

	const app = serverBuilder.build();
	const server = app.listen(port) as import('http').Server;
	logger.info(`App listening on the port ${port}`);

	// ensure prisma is connected (optional, will fail fast if DB unreachable)
	try {
		const prisma = container.get<PrismaService>(TYPES.PrismaService);
		await prisma.connect();
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			logger.warn('Prisma connect failed during startup', { error: msg });
		}

	const shutdown = async (signal: string) => {
		try {
			logger.info(`Received ${signal}. Shutting down gracefully...`);
			server.close(async (closeErr) => {
								if (closeErr) {
									const msg = closeErr instanceof Error ? closeErr.message : String(closeErr);
									logger.error('Error closing http server', { error: msg });
									process.exit(1);
								}
				try {
					const prisma = container.get<PrismaService>(TYPES.PrismaService);
					await prisma.disconnect();
								} catch (e) {
									const msg = e instanceof Error ? e.message : String(e);
									logger.warn('Error disconnecting prisma during shutdown', { error: msg });
								}
				logger.info('Shutdown complete');
				process.exit(0);
			});
			// fallback timeout
			setTimeout(() => {
				logger.warn('Forcing shutdown after timeout');
				process.exit(1);
			}, 30_000).unref();
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				logger.error('Unhandled error during shutdown', { error: msg });
				process.exit(1);
			}
	};

	process.on('SIGTERM', () => shutdown('SIGTERM'));
	process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
	// eslint-disable-next-line no-console
	console.error('Failed to start application', err);
	process.exit(1);
});
