import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('sales-summary')
  salesSummary(
    @Query('warehouseId') warehouseId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.salesSummary(warehouseId, from, to);
  }

  @Get('daily-sales')
  dailySales(@Query('warehouseId') warehouseId?: string) {
    return this.service.dailySales(warehouseId);
  }

  @Get('top-products')
  topProducts(@Query('limit') limit = 10) {
    return this.service.topProducts(+limit);
  }

  @Get('inventory-summary')
  inventorySummary(@Query('warehouseId') warehouseId?: string) {
    return this.service.inventorySummary(warehouseId);
  }

  @Get('purchase-summary')
  purchaseSummary(@Query('warehouseId') warehouseId?: string) {
    return this.service.purchaseSummary(warehouseId);
  }
}
