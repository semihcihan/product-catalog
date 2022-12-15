import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { ERROR_CODES } from 'src/utils/error-codes';
import { AppException } from './exception';

const handleCastErrorDB = (err) => {
  if (err.kind === 'ObjectId') {
    return new AppException(
      'No document found with that ID',
      HttpStatus.NOT_FOUND,
    );
  }
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppException(message, HttpStatus.BAD_REQUEST);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppException(message, HttpStatus.BAD_REQUEST);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => (el as any).message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppException(message, HttpStatus.BAD_REQUEST);
};

const handleValidationErrorPipe = (err) => {
  if (
    !(
      err.response &&
      Array.isArray(err.response) &&
      err.response.length > 0 &&
      err.response[0].constraints
    )
  ) {
    return new AppException('Invalid input data.', HttpStatus.BAD_REQUEST);
  }
  const errors = err.response.map((e) =>
    Object.values(e.constraints).join('. '),
  );
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppException(message, HttpStatus.BAD_REQUEST);
};

const handleJWTError = () =>
  new AppException(
    'Invalid token. Please log in again!',
    HttpStatus.UNAUTHORIZED,
  );

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private configService: ConfigService,
  ) {}

  catch(exception: Error, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;
    if (exception.name === 'CastError') {
      exception = handleCastErrorDB(exception);
    }
    if ((exception as any).code === 11000) {
      exception = handleDuplicateFieldsDB(exception);
    }
    if (exception.name === 'ValidationError') {
      exception = handleValidationErrorDB(exception);
    }
    if ((exception as any).status === ERROR_CODES.VALIDATION_PIPE) {
      exception = handleValidationErrorPipe(exception);
    }
    if (exception.name === 'InvalidTokenError') {
      exception = handleJWTError();
    }

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (this.configService.get<string>('NODE_ENV') === 'development') {
      httpAdapter.reply(
        ctx.getResponse(),
        {
          status: httpStatus,
          error: exception,
          message: exception.message,
          stack: exception.stack,
        },
        httpStatus,
      );
    } else {
      if (exception instanceof AppException) {
        httpAdapter.reply(
          ctx.getResponse(),
          {
            status: 'error',
            message: exception.message,
          },
          httpStatus,
        );
      } else {
        httpAdapter.reply(
          ctx.getResponse(),
          {
            status: 'error',
            message: 'Something went very wrong!',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
