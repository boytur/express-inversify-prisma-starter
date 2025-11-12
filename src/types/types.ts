export const TYPES = {
  // Prisma
  PrismaService: Symbol.for('PrismaService'),

  // User
  UserController: Symbol.for('UserController'),
  UserService: Symbol.for('UserService'),
  UserRepository: Symbol.for('UserRepository'),

  // Auth
  AuthMiddleware: Symbol.for('AuthMiddleware'),
  // Crypto
  CryptoService: Symbol.for('CryptoService'),
};
