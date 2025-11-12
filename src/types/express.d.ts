import { Request } from 'express';
import { IUserPayload } from './auth';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUserPayload | null;
  }
}
