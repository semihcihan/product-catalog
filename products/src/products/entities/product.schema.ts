import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Category } from 'src/categories/entities/category.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop()
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
}

export const ProductSchema = SchemaFactory.createForClass(Product);

/* 
category
    title
    description
    html

product
    title
    productType
    tags
    html
    images
    variants
    categories
    
variant (embedded to product)
    title
    barcode
    quantity
    position
    price
    product_id
    sku
*/
