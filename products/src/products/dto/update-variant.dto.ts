import { PartialType } from '@nestjs/mapped-types';
import { Variant } from '../entities/variant.schema';

export class UpdateVariantDto extends PartialType(Variant) {}
