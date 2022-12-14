import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { AnaltyicsLog } from 'src/analytics/entities/analytics-log.schema';

@Injectable()
export class Logger implements NestMiddleware {
  constructor(private analyticsService: AnalyticsService) {}
  use(req: Request & { user: any }, res: Response, next: NextFunction) {
    const payload = {
      body: req.body,
      ip: req.ip,
      params: req.params,
      query: req.query,
      url: req.baseUrl,
      method: req.method,
    };

    this.analyticsService.create({
      action: this.action(req),
      payload,
      requestUserId: req.user ? req.user.id : undefined,
    });
    next();
  }

  action(req: Request): string {
    let action = '';
    if (req.baseUrl.includes('images')) {
      action = 'product.image';
    } else if (req.baseUrl.includes('variant')) {
      action = 'product.variant';
    } else if (req.baseUrl.includes('categories')) {
      action = 'category';
    }

    return action + '.' + req.method;
  }
}
