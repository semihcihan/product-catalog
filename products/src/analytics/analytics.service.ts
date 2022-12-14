import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { APIFeatures } from 'src/utils/api-features';
import {
  AnaltyicsLog,
  AnaltyicsLogDocument,
} from './entities/analytics-log.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(AnaltyicsLog.name)
    private analyticsLogModel: Model<AnaltyicsLogDocument>,
  ) {}
  create(log: AnaltyicsLog) {
    return this.analyticsLogModel.create(log);
  }

  async findAll(query: Record<string, any>): Promise<AnaltyicsLogDocument[]> {
    const features = new APIFeatures<AnaltyicsLogDocument>(
      this.analyticsLogModel.find(),
      query,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    return await features.query.lean();
  }
}
