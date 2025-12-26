import {
  IsArray,
  IsDate,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SaleLineDto {
  @IsString()
  productId: string;

  quantity: number;

  unitPrice: number;

  expirationDate?: Date;

  lotCode?: string;

  serialNumbers: string[] = [];
}

export class CreateSaleDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsString()
  warehouseId: string;

  @IsDate()
  @Type(() => Date)
  saleDate: Date;

  @IsString()
  currency?: string = 'USD';

  @IsOptional()
  @IsString()
  paymentType?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleLineDto)
  lines: SaleLineDto[];
}
