import { PrismaClient } from '@prisma/client';
import { injectable } from 'inversify';

@injectable()
export class PrismaService {
  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient();
  }

  get client(): PrismaClient {
    return this._prisma;
  }

  public async connect(): Promise<void> {
    try {
      await this._prisma.$connect();
    } catch (err) {
      // swallow: connection may be lazy in some environments
      // callers can still use client which will connect on demand
      // but this helps in long-running processes to eagerly connect
      // and fail fast if DB is unreachable.
      // eslint-disable-next-line no-console
      console.warn('Prisma connect failed or skipped', err);
    }
  }

  public async disconnect(): Promise<void> {
    await this._prisma.$disconnect();
  }
}
