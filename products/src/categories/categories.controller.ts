import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(Role.Admin)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const res = await this.categoriesService.create(createCategoryDto);
    return {
      status: 'success',
      data: res,
    };
  }

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    const res = await this.categoriesService.findAll(query);
    return {
      status: 'success',
      length: res.length,
      data: res,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const res = await this.categoriesService.findOne(id);
    return {
      status: 'success',
      data: res,
    };
  }

  @Patch(':id')
  @Roles(Role.Admin)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const res = await this.categoriesService.update(id, updateCategoryDto);
    return {
      status: 'success',
      data: res,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.Admin)
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
    return {
      status: 'success',
      data: {},
    };
  }
}
