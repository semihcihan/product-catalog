import { HttpException, HttpExceptionOptions } from '@nestjs/common';

export class AppException extends HttpException {
  isOperational: boolean;

  constructor(
    response: string | Record<string, any>,
    status: number,
    options?: HttpExceptionOptions,
  ) {
    super(response, status, options);
    this.isOperational = true;
  }
}
