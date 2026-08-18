import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '../../utils/jwt.utils';
import { CacheService } from '../cache/cache.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IAuthorizedRequest, IUserPayload } from '../interfaces/request.interface';

interface IDecodedToken extends IUserPayload {
  iat: number;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IAuthorizedRequest>();

    const token =
      request.cookies?.['accessToken'] ||
      request.cookies?.['registerOtpVerify'] ||
      request.cookies?.['forgotPassword'] ||
      request.cookies?.['finalForgotPassword'];

    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    try {

      const decoded = this.jwtService.verifyToken<IDecodedToken>(token);

      if (decoded.userId && decoded.iat) {
        const key = `user:password_changed:${decoded.userId}`;
        const cachedTimeString = await this.cacheService.get(key);

        if (cachedTimeString) {
          const passwordChangedSeconds = Math.floor(
            new Date(cachedTimeString).getTime() / 1000
          );

          if (passwordChangedSeconds > decoded.iat) {
            throw new UnauthorizedException(
              'Password was changed recently. Please log in again.'
            );
          }
        }
      }

      const userPayload: IUserPayload = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        branchId: decoded.branchId,
      };

      if (decoded.role?.toUpperCase() === 'SUPER_ADMIN') {
        const cacheKey = `superadmin:active_branch:${decoded.userId}`;
        const activeBranchId = await this.cacheService.getActiveBranchId(cacheKey);

        if (activeBranchId) {
          userPayload.branchId = activeBranchId;
        }
      }

      request.user = userPayload;
      return true;

    } catch (error) {

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }
}