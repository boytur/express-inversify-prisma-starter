import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import { errorMiddleware } from '@/middleware/error.middleware';
import swaggerDocs from '@/docs/swagger';
import { logger } from '@/utils/logger';
import { requestLogger } from '@/middleware/request.logger';

export class App {
  public readonly app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.error();
  }

  private config(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    // request logging (access logs)
    this.app.use(requestLogger);
    this.app.use(cors());
    swaggerDocs(this.app);
    // healthcheck for orchestrators / load balancers
    this.app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'ok' });
    });
  }

  private routes(): void {
    // Controller routing is handled by inversify-express-utils when controllers
    // are registered/decorated. No manual router wiring necessary here.
  }

  private error(): void {
    this.app.use(errorMiddleware);
  }

  public listen(port: number): import('http').Server {
    const server = this.app.listen(port, () => {
      logger.info(`App listening on the port ${port}`);
    });

    // return server reference for graceful shutdown
    return server as import('http').Server;
  }
}
