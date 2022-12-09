import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './entities/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}
  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryDocument> {
    const object = new this.categoryModel(createCategoryDto);
    return await object.save();
  }

  findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel.find().exec();
  }

  findOne(id: string): Promise<CategoryDocument> {
    return this.categoryModel.findById(id).exec();
  }

  update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryDocument> {
    return this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  remove(id: string): Promise<CategoryDocument> {
    return this.categoryModel.findByIdAndDelete(id).exec();
  }
}
