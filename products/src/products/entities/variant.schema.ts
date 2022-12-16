import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsNotEmpty,
  IsNumber,
  Min,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type VariantDocument = HydratedDocument<Variant>;

@Schema({ timestamps: true })
export class Variant {
  @IsNotEmpty()
  @Prop({ required: true })
  title: string;

  @Prop()
  barcode: string;

  @IsNumber()
  @Min(0)
  @Prop({ min: 0 })
  quantity: number;

  @IsArray()
  @ArrayNotEmpty()
  @Prop({
    type: raw([
      {
        price: { type: Number, min: 0 },
        currency: { type: String },
      },
    ]),
    validate: (v: { price: number; currency: string }[]) => {
      if (!Array.isArray(v) || v.length === 0) {
        return false;
      }
      return !v.some((el) => !el.price || !el.currency);
    },
  })
  prices: Record<string, any>[];

  @IsNumber()
  @Min(0)
  @Prop({ min: 0 })
  position: number;

  @Prop()
  sku: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  imageId: Types.ObjectId;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);
