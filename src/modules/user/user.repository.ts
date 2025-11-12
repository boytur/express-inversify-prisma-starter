import { injectable, inject } from 'inversify';
import { TYPES } from '../../types/types';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { BaseRepository } from '../../common/base.repository';
import { IUserRepository } from './user.repository.interface';

@injectable()
export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor(@inject(TYPES.PrismaService) prismaService: PrismaService) {
    super(prismaService);
  }
  public async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  public async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
