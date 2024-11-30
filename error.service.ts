import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class ErrorService {
  private httpError(messages: string[], data = {}, type: HttpStatus) {
    throw new HttpException(
      {
        success: false,
        messages,
        data,
      },
      type,
    );
  }

  // this.error.unprocessableEntity(['ERROR'])
  /**
   * throw new HttpException(
   *  {
        success: false,
        messages: ['ERROR'],
        data: null,
      },
      HttpStatus.UNPROCESSABLE_ENTITY
   * )
   */
  unprocessableEntity(messages: string[], data = {}) {
    this.httpError(messages, data, HttpStatus.UNPROCESSABLE_ENTITY);
  }

  unauthorized(messages = ['ورود شما غیرمجاز است'], data = {}) {
    this.httpError(messages, data, HttpStatus.UNAUTHORIZED);
  }

  forbidden(messages = ['دسترسی برای شما امکان پذیر نیست'], data = {}) {
    this.httpError(messages, data, HttpStatus.FORBIDDEN);
  }

  internalServerError(
    messages = ['خطای غیرمنتظره ای رخ داده است، دوباره تلاش کنید'],
    data = {},
  ) {
    this.httpError(messages, data, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  methodNotAllowed(
    messages = ['شما اجازه استفاده از این بخش را ندارید'],
    data = {},
  ) {
    this.httpError(messages, data, HttpStatus.METHOD_NOT_ALLOWED);
  }
}
