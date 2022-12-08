import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type VariantDocument = HydratedDocument<Variant>;

@Schema({ timestamps: true })
export class Variant {
  @Prop()
  title: string;

  @Prop()
  barcode: string;

  @Prop()
  quantity: number;

  @Prop(
    raw([
      {
        price: { type: Number },
        currency: { type: String },
      },
    ]),
  )
  prices: Record<string, any>[];

  @Prop()
  position: number;

  @Prop()
  sku: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  imageId: Types.ObjectId;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);
