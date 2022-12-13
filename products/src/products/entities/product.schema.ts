import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Category } from 'src/categories/entities/category.schema';
import { Variant, VariantSchema } from './variant.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, minlength: 1 })
  title: string;

  @Prop()
  productType: string;

  @Prop()
  tags: string[];

  @Prop()
  html: string;

  @Prop(
    raw([
      {
        url: { type: String },
      },
    ]),
  )
  images: Record<string, any>[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
  categories: Category[];

  @Prop({
    type: [VariantSchema],
    validate: (v: any) => Array.isArray(v) && v.length > 0,
  })
  variants: Variant[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

export const ProductSchemaWithMiddlewares = () => {
  const schema = ProductSchema;
  schema.pre(/find.*/, function () {
    this.populate('categories');
  });
  return schema;
};
