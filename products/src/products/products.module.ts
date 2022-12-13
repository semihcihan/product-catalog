import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductSchemaWithMiddlewares,
  Product,
} from './entities/product.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      { name: Product.name, useFactory: ProductSchemaWithMiddlewares },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
