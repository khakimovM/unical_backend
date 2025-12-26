import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Sale, SaleSchema } from '../sale/schemas/sale.schema';
import {
  PurchaseReceipt,
  PurchaseReceiptSchema,
} from '../purchase-receipt/schemas/purchase-receipt.schema';
import {
  StockSummary,
  StockSummarySchema,
} from '../inventory/schemas/stock-summary.schema';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: PurchaseReceipt.name, schema: PurchaseReceiptSchema },
      { name: StockSummary.name, schema: StockSummarySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
