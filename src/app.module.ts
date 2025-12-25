import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { ProductModule } from './modules/product/product.module';
import { PurchaseReceiptModule } from './modules/purchase-receipt/purchase-receipt.module';
import { SaleModule } from './modules/sale/sale.module';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [CoreModule, ProductModule, PurchaseReceiptModule, SaleModule, InventoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
