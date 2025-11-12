import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { logger } from '@/utils/logger';
import { ICryptoService } from '@/services/utils';
import { IUserPayload } from '@/types/auth';
import { TYPES } from '@/types/types';

@injectable()
export class AuthMiddleware {
  constructor(@inject(TYPES.CryptoService) private readonly crypto: ICryptoService) {}

  public use(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.crypto.verify(token) as IUserPayload;
      req.user = payload;
      next();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn('Invalid JWT', { error: msg });
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}

// Note: this middleware is intended to be used via DI (inject AuthMiddleware and call
// its `use` method) or registered via inversify-express-utils bindings. We do not
// construct it directly here because it requires DI-provided dependencies.
