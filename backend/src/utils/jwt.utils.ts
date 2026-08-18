import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

@Injectable()
export class JwtService {
  private readonly secretKey =
    process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

  private readonly refreshSecret =
    process.env.REFRESH_SECRET || crypto.randomBytes(32).toString('hex');

  generateToken(payload: object, expiresIn: string = '1d'): string {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verifyToken<T = any>(token: string): T {
    return jwt.verify(token, this.secretKey) as T;
  }

  generateRefreshToken(payload: object, expiresIn: string = '7d'): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verifyRefreshToken<T = any>(token: string): T {
    return jwt.verify(token, this.refreshSecret) as T;
  }
}