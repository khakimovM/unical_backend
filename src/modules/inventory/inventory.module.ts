import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StockSummary,
  StockSummarySchema,
} from './schemas/stock-summary.schema';
import { SerialStock, SerialStockSchema } from './schemas/serial-stock.schema';
import { LotStock, LotStockSchema } from './schemas/lot-stock.schema';
import {
  ExpirableStock,
  ExpirableStockSchema,
} from './schemas/expirable-stock.schema';
import { InventoryService } from './inventory.service';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    ProductModule,
    MongooseModule.forFeature([
      { name: StockSummary.name, schema: StockSummarySchema },
      { name: SerialStock.name, schema: SerialStockSchema },
      { name: LotStock.name, schema: LotStockSchema },
      { name: ExpirableStock.name, schema: ExpirableStockSchema },
    ]),
  ],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
