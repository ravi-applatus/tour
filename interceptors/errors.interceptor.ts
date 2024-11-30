import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
  HttpException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error?.response?.success === false) {
          throw error;
        } else if (error?.response?.statusCode) {
          throw new HttpException(
            {
              success: false,
              messages:
                error instanceof PayloadTooLargeException
                  ? 'حجم فایل شما زیاد می‌باشد'
                  : typeof error?.response?.message === 'object'
                  ? error?.response?.message || 'Error'
                  : [error?.response?.error || 'Error'],
              data: {},
            },
            error?.response?.statusCode,
          );
        } else {
          console.error(error);
          throw new InternalServerErrorException({
            success: false,
            messages: [error?.message || 'خطای غیرمنتظره ای رخ داده است'],
            data: {},
          });
        }
      }),
    );
  }
}
