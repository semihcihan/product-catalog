import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, MinLength } from 'class-validator';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @IsNotEmpty()
  @MinLength(3)
  @Prop({ required: true, minlength: 3, unique: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  html: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
