import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppException } from 'src/exceptions/exception';
import { APIFeatures } from 'src/utils/api-features';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { Product, ProductDocument } from './entities/product.schema';
import { VariantDocument } from './entities/variant.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    images: Array<string>,
  ): Promise<ProductDocument> {
    const imgs = images.map((i) => {
      return {
        url: i,
      };
    });
    const object = new this.productModel({ ...createProductDto, images: imgs });
    return await object.save();
  }

  async findAll(query: Record<string, any>): Promise<ProductDocument[]> {
    const features = new APIFeatures<ProductDocument>(
      this.productModel.find(),
      query,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    return await features.query.lean();
  }

  findOne(id: string) {
    return this.productModel.findById(id).lean().exec();
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    images: Array<string>,
  ) {
    const imgs = images.map((i) => {
      return {
        url: i,
      };
    });

    const updateProductDtoWithImages: Partial<Product> = {
      ...updateProductDto,
    };
    if (imgs && imgs.length > 0) {
      updateProductDtoWithImages.images = imgs;
    }
    const product = await this.productModel
      .findByIdAndUpdate(id, updateProductDtoWithImages, { new: true })
      .lean();
    return product;
  }

  async remove(id: string) {
    await this.productModel.findByIdAndDelete(id).lean().exec();
    return {};
  }

  async updateVariant(
    id: string,
    variantId: string,
    updateVariantDto: UpdateVariantDto,
  ) {
    const product: ProductDocument = await this.productModel.findById(id);
    const variant = (
      product.variants as Types.DocumentArray<VariantDocument>
    ).id(variantId);
    if (!variant) {
      throw new AppException(
        'No document found with that ID',
        HttpStatus.NOT_FOUND,
      );
    }
    variant.set(updateVariantDto);
    await variant.save();
    return product;
  }

  async deleteVariant(id: string, variantId: string) {
    const product: ProductDocument = await this.productModel.findById(id);
    const variant = (
      product.variants as Types.DocumentArray<VariantDocument>
    ).id(variantId);
    if (!variant) {
      throw new AppException(
        'No document found with that ID',
        HttpStatus.NOT_FOUND,
      );
    }
    await variant.remove();
    await product.save();
    return {};
  }

  async updateVariants(id: string, createVariantDtos: CreateVariantDto[]) {
    const product: ProductDocument = await this.productModel.findById(id);
    product.variants = createVariantDtos;
    await product.save();
    return product;
  }

  async updateImage(id: string, imageId: string, image: string) {
    const product: ProductDocument = await this.productModel.findById(id);
    const imageToUpdate = (
      product.images as Types.DocumentArray<Record<string, string>>
    ).id(imageId);

    if (!image || image.length === 0) {
      throw new AppException('Invalid argument', HttpStatus.BAD_REQUEST);
    }

    if (!imageToUpdate) {
      throw new AppException(
        'No document found with that ID',
        HttpStatus.NOT_FOUND,
      );
    }
    imageToUpdate.set({ url: image });
    await product.save();
    return product;
  }

  async deleteImage(id: string, imageId: string) {
    const product: ProductDocument = await this.productModel.findById(id);
    const imageToDelete = (
      product.images as Types.DocumentArray<Record<string, string>>
    ).id(imageId);
    if (!imageToDelete) {
      throw new AppException(
        'No document found with that ID',
        HttpStatus.NOT_FOUND,
      );
    }
    await imageToDelete.remove();
    await product.save();
    return {};
  }

  async updateImages(id: string, images: string[]) {
    const product: ProductDocument = await this.productModel.findById(id);

    product.images = images.map((i) => {
      return {
        url: i,
      };
    });
    await product.save();
    return product;
  }
}
