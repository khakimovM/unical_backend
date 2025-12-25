import { Injectable } from '@nestjs/common';
import { CreatePurchaseReceiptDto } from './dto/create-purchase-receipt.dto';
import { UpdatePurchaseReceiptDto } from './dto/update-purchase-receipt.dto';

@Injectable()
export class PurchaseReceiptService {
  create(createPurchaseReceiptDto: CreatePurchaseReceiptDto) {
    return 'This action adds a new purchaseReceipt';
  }

  findAll() {
    return `This action returns all purchaseReceipt`;
  }

  findOne(id: number) {
    return `This action returns a #${id} purchaseReceipt`;
  }

  update(id: number, updatePurchaseReceiptDto: UpdatePurchaseReceiptDto) {
    return `This action updates a #${id} purchaseReceipt`;
  }

  remove(id: number) {
    return `This action removes a #${id} purchaseReceipt`;
  }
}
