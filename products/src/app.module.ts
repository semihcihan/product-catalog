import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesModule } from './categories/categories.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';
import { JWTVerifier } from './middlewares/jwt-verifier.middleware';
import { AnalyticsModule } from './analytics/analytics.module';
import extractJwtUser from './middlewares/extract-jwt-user.middleware';
import { Logger } from './middlewares/logger.middleware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

ConfigModule.forRoot({
  isGlobal: true,
});

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService
          .get<string>('DATABASE')
          .replace(
            '<PASSWORD>',
            configService.get<string>('DATABASE_PASSWORD'),
          ),
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    CategoriesModule,
    AnalyticsModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: 60 * 60,
        limit: +configService.get<string>('MAX_NUMBER_OF_REQUESTS_PER_HOUR'),
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JWTVerifier, extractJwtUser).forRoutes(
      {
        path: '*',
        method: RequestMethod.POST,
      },
      {
        path: '*',
        method: RequestMethod.DELETE,
      },
      {
        path: '*',
        method: RequestMethod.PATCH,
      },
      {
        path: '*',
        method: RequestMethod.PUT,
      },
      {
        path: '*/analytics',
        method: RequestMethod.GET,
      },
    );

    consumer.apply(Logger).forRoutes('*');
  }
}
