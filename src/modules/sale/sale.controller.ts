import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CancelSaleDto } from './dto/cancel-sale.dto';

@Controller('sales')
export class SaleController {
  constructor(private readonly service: SaleService) {}

  @Post()
  create(@Body() dto: CreateSaleDto) {
    return this.service.create(dto);
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.service.confirm(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Body() dto: CancelSaleDto) {
    return this.service.cancel(id, dto.reason);
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
