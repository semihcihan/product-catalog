import { Injectable, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { Product, ProductDocument } from './entities/product.schema';
import { VariantDocument } from './entities/variant.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const object = new this.productModel(createProductDto);
    return await object.save();
  }

  findAll(): Promise<ProductDocument[]> {
    return this.productModel.find().exec();
  }

  findOne(id: string) {
    return this.productModel.findById(id).exec();
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.productModel
      .findByIdAndUpdate(id, updateProductDto, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  remove(id: string) {
    return this.productModel.findByIdAndDelete(id).exec();
  }

  async updateVariant(
    id: string,
    variantId: string,
    updateVariantDto: UpdateVariantDto,
  ) {
    const product: ProductDocument = await this.productModel
      .findById(id)
      .exec();
    const variant = (
      product.variants as Types.DocumentArray<VariantDocument>
    ).id(variantId);
    if (!variant) {
      throw new Error('404');
    }
    variant.set(updateVariantDto);
    await variant.save();
    return product;
  }
}
