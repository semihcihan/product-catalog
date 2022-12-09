import { PartialType } from '@nestjs/swagger';
import { Variant } from '../entities/variant.schema';

export class UpdateVariantDto extends PartialType(Variant) {}
