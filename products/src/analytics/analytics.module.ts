import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AnaltyicsLog,
  AnalyticsLogSchema,
} from './entities/analytics-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnaltyicsLog.name, schema: AnalyticsLogSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
