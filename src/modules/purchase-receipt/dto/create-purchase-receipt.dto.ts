import { IsArray, IsDate, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PurchaseLineDto {
  @IsString()
  productId: string;

  quantity: number;

  unitPrice: number;

  expirationDate?: Date;

  lotCode?: string;

  serialNumbers: string[] = [];
}

export class CreatePurchaseReceiptDto {
  @IsString()
  supplierId: string;

  @IsString()
  warehouseId: string;

  @IsDate()
  @Type(() => Date)
  receiptDate: Date;

  @IsString()
  currency?: string = 'USD';

  @IsString()
  invoiceNumber?: string;

  @IsString()
  comment?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseLineDto)
  lines: PurchaseLineDto[];
}
