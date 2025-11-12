import 'reflect-metadata';
import { UserService } from '../user.service';
import { IUserRepository } from '../user.repository.interface';
import { User } from '@prisma/client';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };
    const cryptoService = {
      sign: jest.fn().mockReturnValue('test-token'),
      verify: jest.fn(),
    };
    // @ts-ignore satisfy DI-less constructor in tests
    userService = new UserService(userRepository, cryptoService);
  });

  it('should create a new user', async () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'password',
    };
    const user: User = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedpassword',
      name: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    userRepository.create.mockResolvedValue(user);

    const result = await userService.createUser(createUserDto);

    expect(result).toEqual(user);
    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: null,
      password: expect.any(String),
    });
  });

  it('should login a user and return a token', async () => {
    const loginUserDto = {
      email: 'test@example.com',
      password: 'password',
    };
    const user: User = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedpassword',
      name: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    userRepository.findByEmail.mockResolvedValue(user);
    const bcrypt = require('bcryptjs');
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const result = await userService.loginUser(loginUserDto);

    expect(result).toEqual(expect.any(String));
    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
  });
});
