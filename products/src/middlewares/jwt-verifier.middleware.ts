import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';

@Injectable()
export class JWTVerifier implements NestMiddleware {
  constructor(private configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    auth({
      audience: this.configService.get<string>('AUTH0_AUDIENCE'),
      issuerBaseURL: this.configService.get<string>('AUTH0_ISSUER_BASE_URL'),
    })(req, res, next);
  }
}
