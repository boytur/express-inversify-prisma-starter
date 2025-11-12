import 'reflect-metadata';
import { Container } from 'inversify';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES } from '@/types/types';
import '@/modules/user/user.controller';
import { UserService } from '@/modules/user/user.service';
import { UserRepository } from '@/modules/user/user.repository';
import { AuthMiddleware } from '@/middleware/auth.middleware';
import { CryptoService, ICryptoService } from '@/services/utils';

const container = new Container();

// Prisma
container.bind<PrismaService>(TYPES.PrismaService).to(PrismaService).inSingletonScope();

// User
container.bind<UserService>(TYPES.UserService).to(UserService).inRequestScope();
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();

// Auth
container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware).inRequestScope();
// Crypto
container.bind<ICryptoService>(TYPES.CryptoService).to(CryptoService).inTransientScope();

export default container;
