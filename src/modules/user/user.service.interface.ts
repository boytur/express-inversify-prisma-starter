import { User } from '@prisma/client';
import { CreateUserDto, LoginUserDto } from './user.dto';

export interface IUserService {
  createUser(dto: CreateUserDto): Promise<User>;
  loginUser(dto: LoginUserDto): Promise<string | null>;
}
