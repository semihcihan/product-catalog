import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, minlength: 3, unique: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  html: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
