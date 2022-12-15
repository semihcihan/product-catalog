import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFiles,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { SharpPipe } from 'src/pipes/sharp.pipe';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.Admin)
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles(SharpPipe)
    images: Array<string>,
  ) {
    const res = await this.productsService.create(createProductDto, images);
    return {
      status: 'success',
      data: res,
    };
  }

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    const res = await this.productsService.findAll(query);
    return {
      status: 'success',
      length: res.length,
      data: res,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const res = await this.productsService.findOne(id);
    return {
      status: 'success',
      data: res,
    };
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @UseInterceptors(FilesInterceptor('images'))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles(SharpPipe)
    images: Array<string>,
  ) {
    const res = await this.productsService.update(id, updateProductDto, images);
    return {
      status: 'success',
      data: res,
    };
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
    return {
      status: 'success',
      data: {},
    };
  }

  //variants

  @Patch(':id/variants/:variantId')
  @Roles(Role.Admin)
  async updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    const res = await this.productsService.updateVariant(
      id,
      variantId,
      updateVariantDto,
    );
    return {
      status: 'success',
      data: res,
    };
  }

  @Delete(':id/variants/:variantId')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
  ) {
    await this.productsService.deleteVariant(id, variantId);
    return {
      status: 'success',
      data: {},
    };
  }

  @Patch(':id/variants/')
  @Roles(Role.Admin)
  async updateVariants(
    @Param('id') id: string,
    @Body() variants: CreateVariantDto[],
  ) {
    const res = await this.productsService.updateVariants(id, variants);
    return {
      status: 'success',
      data: res,
    };
  }

  //images

  @Patch(':id/images/:imageId')
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('image'))
  async updateImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @UploadedFile(SharpPipe)
    image: string,
  ) {
    const res = await this.productsService.updateImage(id, imageId, image);
    return {
      status: 'success',
      data: res,
    };
  }

  @Delete(':id/images/:imageId')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    await this.productsService.deleteImage(id, imageId);
    return {
      status: 'success',
      data: {},
    };
  }

  @Patch(':id/images/')
  @Roles(Role.Admin)
  @UseInterceptors(FilesInterceptor('images'))
  async updateImages(
    @Param('id') id: string,
    @UploadedFiles(SharpPipe)
    images: Array<string>,
  ) {
    const res = await this.productsService.updateImages(id, images);
    return {
      status: 'success',
      data: res,
    };
  }
}
