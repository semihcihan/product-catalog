import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Roles(Role.Admin)
  async findAll(@Query() query: Record<string, any>) {
    const res = await this.analyticsService.findAll(query);
    return {
      status: 'success',
      length: res.length,
      data: res,
    };
  }
}
