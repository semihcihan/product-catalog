import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exceptions/exception.filter';
import helmet from 'helmet';
import { json, urlencoded } from 'body-parser';
import xss = require('xss-clean');
import mongoSanitize = require('express-mongo-sanitize');
import hpp = require('hpp');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpAdapter = app.get(HttpAdapterHost);
  const configService = app.get(ConfigService);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter, configService));
  app.setGlobalPrefix('api');
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });

  app.enableCors();
  app.use(helmet());

  app.use(json({ limit: '10kb' }));
  app.use(urlencoded({ extended: true, limit: '10kb' }));

  app.use(mongoSanitize());
  app.use(xss());

  app.use(
    hpp({
      whitelist: [
        'title',
        'username',
        'productType',
        'tags',
        'categories',
        'barcode',
        'quantity',
        'sku',
      ],
    }),
  );

  await app.listen(configService.get('PORT'));
}
bootstrap();
