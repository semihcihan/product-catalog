import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    const res = await this.analyticsService.findAll(query);
    return {
      status: 'success',
      length: res.length,
      data: res,
    };
  }
}
