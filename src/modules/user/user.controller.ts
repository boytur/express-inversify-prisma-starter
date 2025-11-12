import { inject } from 'inversify';
import {
  controller,
  httpPost,
  request,
  response,
  requestBody,
} from 'inversify-express-utils';
import { Request, Response } from 'express';
import { TYPES } from '@/types/types';
import { IUserService } from './user.service.interface';
import { validate } from '@/common/validation';
import { createUserSchema, loginUserSchema } from './user.schema';

/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: User management
 */
@controller('/api/users')
export class UserController {
  constructor(@inject(TYPES.UserService) private readonly userService: IUserService) {}

  /**
   * @openapi
   * /api/users/register:
   *   post:
   *     tags: [Users]
   *     summary: Register a new user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateUser'
   *     responses:
   *       201:
   *         description: User created successfully
   */
  @httpPost('/register', validate(createUserSchema))
  public async register(@request() req: Request, @response() res: Response) {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * @openapi
   * /api/users/login:
   *   post:
   *     tags: [Users]
   *     summary: Login a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginUser'
   *     responses:
   *       200:
   *         description: User logged in successfully
   */
  @httpPost('/login', validate(loginUserSchema))
  public async login(@request() req: Request, @response() res: Response) {
    try {
      const token = await this.userService.loginUser(req.body);
      if (!token) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
