import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PurchaseReceipt,
  PurchaseReceiptSchema,
} from './schemas/purchase-receipt.schema';
import { PurchaseReceiptController } from './purchase-receipt.controller';
import { PurchaseReceiptService } from './purchase-receipt.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PurchaseReceipt.name, schema: PurchaseReceiptSchema },
    ]),
  ],
  controllers: [PurchaseReceiptController],
  providers: [PurchaseReceiptService],
  exports: [PurchaseReceiptService],
})
export class PurchaseReceiptModule {}
