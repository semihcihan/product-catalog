import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AnaltyicsLogDocument = HydratedDocument<AnaltyicsLog>;

@Schema({ timestamps: true })
export class AnaltyicsLog {
  @Prop({ required: true })
  action: string;

  @Prop()
  requestUserId: string;

  @Prop(
    raw({
      url: { type: String },
      body: { type: Object },
      ip: { type: String },
      params: { type: Object },
      query: { type: Object },
      method: { type: String },
    }),
  )
  payload: Record<string, any>;
}

export const AnalyticsLogSchema = SchemaFactory.createForClass(AnaltyicsLog);
