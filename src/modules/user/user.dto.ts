import { z } from 'zod';
import { createUserSchema, loginUserSchema } from './user.schema';

export type CreateUserDto = z.infer<typeof createUserSchema>['body'];
export type LoginUserDto = z.infer<typeof loginUserSchema>['body'];
