import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/types';
import { PrismaService } from '../prisma/prisma.service';

@injectable()
export abstract class BaseRepository<T> {
  protected readonly prisma: PrismaClient;

  constructor(@inject(TYPES.PrismaService) prismaService: PrismaService) {
    this.prisma = prismaService.client;
  }

  // You can add common repository methods here
}
