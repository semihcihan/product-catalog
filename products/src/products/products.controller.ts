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
    return await this.productsService.create(createProductDto, images);
  }

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    return await this.productsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
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
    return await this.productsService.update(id, updateProductDto, images);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }

  //variants

  @Patch(':id/variants/:variantId')
  @Roles(Role.Admin)
  async updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    return await this.productsService.updateVariant(
      id,
      variantId,
      updateVariantDto,
    );
  }

  @Delete(':id/variants/:variantId')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
  ) {
    return await this.productsService.deleteVariant(id, variantId);
  }

  @Patch(':id/variants/')
  @Roles(Role.Admin)
  async updateVariants(
    @Param('id') id: string,
    @Body() variants: CreateVariantDto[],
  ) {
    return await this.productsService.updateVariants(id, variants);
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
    return await this.productsService.updateImage(id, imageId, image);
  }

  @Delete(':id/images/:imageId')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return await this.productsService.deleteImage(id, imageId);
  }

  @Patch(':id/images/')
  @Roles(Role.Admin)
  @UseInterceptors(FilesInterceptor('images'))
  async updateImages(
    @Param('id') id: string,
    @UploadedFiles(SharpPipe)
    images: Array<string>,
  ) {
    return await this.productsService.updateImages(id, images);
  }
}
