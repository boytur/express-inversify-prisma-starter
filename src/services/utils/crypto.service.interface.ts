import { IUserPayload } from '../../types/auth';

export interface ICryptoService {
  sign(payload: IUserPayload, options?: { expiresIn?: string }): string;
  verify(token: string): IUserPayload;
}
