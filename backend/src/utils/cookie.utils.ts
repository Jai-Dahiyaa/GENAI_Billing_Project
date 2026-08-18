import { Response } from 'express';

export interface ICookieOptions {
  name: string;
  value: string;
  maxAge?: number | string;
}

export class CookieUtil {
  private static parseTimeToMs(time?: number | string): number | undefined {
    if (time === undefined || time === null) return undefined;
    if (typeof time === 'number') return time;

    const unit = time.slice(-1).toLowerCase();
    const value = parseInt(time.slice(0, -1), 10);

    if (isNaN(value)) return undefined;

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return parseInt(time, 10);
    }
  }

  static setCookie(res: Response, { name, value, maxAge }: ICookieOptions): void {
    const parsedMaxAge = this.parseTimeToMs(maxAge);

    res.cookie(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      ...(parsedMaxAge !== undefined && { maxAge: parsedMaxAge }),
    });
  }

  static setAuthTokens(
    res: Response,
    accessToken: string,
    refreshToken: string,
    accessMaxAge: number | string = '15m',
    refreshMaxAge: number | string = '7d',
  ): void {
    this.setCookie(res, {
      name: 'accessToken',
      value: accessToken,
      maxAge: accessMaxAge,
    });

    this.setCookie(res, {
      name: 'refreshToken',
      value: refreshToken,
      maxAge: refreshMaxAge,
    });
  }

  static clearCookies(res: Response, cookieNames: string[] = ['accessToken', 'refreshToken']): void {
    cookieNames.forEach((name) => {
      res.clearCookie(name, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    });
  }
}