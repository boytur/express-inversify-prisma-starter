import { injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import { getConfig } from '@/config';
import { ICryptoService } from './crypto.service.interface';
import { IUserPayload } from '@/types/auth';

@injectable()
export class CryptoService implements ICryptoService {
  private readonly secret: jwt.Secret;

  constructor() {
    const cfg = getConfig();
    this.secret = cfg.JWT_SECRET;
  }

  public sign(payload: IUserPayload, options?: { expiresIn?: string }): string {
    const expires = options?.expiresIn ?? '1h';
    const opts: jwt.SignOptions = { expiresIn: expires as jwt.SignOptions['expiresIn'] };
    return jwt.sign(payload as object, this.secret, opts);
  }

  public verify(token: string): IUserPayload {
    const decoded = jwt.verify(token, this.secret) as IUserPayload;
    return decoded;
  }
}
