import { inject, injectable } from 'inversify';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { BaseService } from '@/common/base.service';
import { TYPES } from '@/types/types';
import { IUserRepository } from './user.repository.interface';
import { IUserService } from './user.service.interface';
import { CreateUserDto, LoginUserDto } from './user.dto';
import { ICryptoService } from '@/services/utils';

@injectable()
export class UserService extends BaseService implements IUserService {
  constructor(
  @inject(TYPES.UserRepository) private readonly userRepository: IUserRepository,
  @inject(TYPES.CryptoService) private readonly cryptoService: ICryptoService,
  ) {
    super();
  }

  public async createUser(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const { name, ...rest } = dto;
    return this.userRepository.create({ ...rest, name: name || null, password: hashedPassword });
  }

  public async loginUser(dto: LoginUserDto): Promise<string | null> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const token = this.cryptoService.sign({ id: user.id, email: user.email }, { expiresIn: '1h' });

    return token;
  }
}
