import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  findAll(@Query() query: Record<string, any>) {
    return this.analyticsService.findAll(query);
  }
}
