import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((res) => {
        const message = res?.message || 'Request processed successfully';

        let finalData = res;

        if (res && typeof res === 'object' && !Array.isArray(res)) {
          const { message: _msg, data: innerData, ...restProps } = res;

          if (innerData !== undefined) {
            
            if (Object.keys(restProps).length > 0) {
              finalData = typeof innerData === 'object' && !Array.isArray(innerData)
                ? { ...innerData, ...restProps }
                : { payload: innerData, ...restProps };
            } else {
              finalData = innerData;
            }
          } else {
            finalData = Object.keys(restProps).length > 0 ? restProps : null;
          }
        }

        return {
          statusCode: response.statusCode,
          success: true,
          message: message,
          data: finalData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}