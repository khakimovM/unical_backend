import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PurchaseReceiptService } from './purchase-receipt.service';
import { CreatePurchaseReceiptDto } from './dto/create-purchase-receipt.dto';
import { UpdatePurchaseReceiptDto } from './dto/update-purchase-receipt.dto';

@Controller('purchase-receipt')
export class PurchaseReceiptController {
  constructor(private readonly purchaseReceiptService: PurchaseReceiptService) {}

  @Post()
  create(@Body() createPurchaseReceiptDto: CreatePurchaseReceiptDto) {
    return this.purchaseReceiptService.create(createPurchaseReceiptDto);
  }

  @Get()
  findAll() {
    return this.purchaseReceiptService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseReceiptService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePurchaseReceiptDto: UpdatePurchaseReceiptDto) {
    return this.purchaseReceiptService.update(+id, updatePurchaseReceiptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseReceiptService.remove(+id);
  }
}
