import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PurchaseReceiptService } from './purchase-receipt.service';
import { CreatePurchaseReceiptDto } from './dto/create-purchase-receipt.dto';

@Controller('purchase-receipts')
export class PurchaseReceiptController {
  constructor(private readonly service: PurchaseReceiptService) {}

  @Post()
  create(@Body() dto: CreatePurchaseReceiptDto) {
    return this.service.create(dto);
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.service.confirm(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.service.cancel(id, body.reason);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
