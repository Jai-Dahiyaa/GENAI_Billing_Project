import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { getClientInfo, IExtendedClientInfo } from '../../utils/client-info.utils';

export const ClientInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IExtendedClientInfo => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return getClientInfo(request);
  },
);