import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { TrackingType } from 'src/common/enums/tracking-type.enum';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsString()
  unitOfMeasure: string;

  @IsEnum(TrackingType)
  trackingType: TrackingType;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  minStockLevel?: number;

  @IsOptional()
  salePriceDefault?: number;

  @IsOptional()
  purchasePriceDefault?: number;

  @IsOptional()
  @IsBoolean()
  isVariantParent?: boolean = false;

  @IsOptional()
  variantAttributes?: Record<string, any>;

  @IsOptional()
  @IsString()
  parentId?: string;
}
