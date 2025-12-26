import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { PurchaseReceipt } from './schemas/purchase-receipt.schema';
import { CreatePurchaseReceiptDto } from './dto/create-purchase-receipt.dto';
import { DocumentStatus } from '../../common/enums/document-status.enum';
import { InventoryService } from '../inventory/inventory.service';
import { ErpException } from '../../common/exceptions/erp.exception';

@Injectable()
export class PurchaseReceiptService {
  constructor(
    @InjectModel(PurchaseReceipt.name) private model: Model<PurchaseReceipt>,
    private inventoryService: InventoryService,
  ) {}

  async create(dto: CreatePurchaseReceiptDto) {
    const receipt = new this.model({
      ...dto,
      status: DocumentStatus.DRAFT,
      createdBy: 'currentUserId', // keyin guarddan
    });
    return receipt.save();
  }

  async confirm(id: string) {
    const receipt = await this.findOne(id);
    if (receipt.status !== DocumentStatus.DRAFT)
      throw new ErpException('INVALID_STATUS', 'Only DRAFT can be confirmed');

    const session = await this.model.db.startSession();
    session.startTransaction();

    try {
      await this.inventoryService.increaseStock(
        receipt.lines,
        receipt.warehouseId,
        receipt._id.toString(),
        session,
      );

      receipt.status = DocumentStatus.CONFIRMED;
      receipt.confirmedBy = 'currentUserId';
      receipt.confirmedAt = new Date();

      await receipt.save({ session });
      await session.commitTransaction();
      return receipt;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async cancel(id: string, reason: string) {
    const receipt = await this.findOne(id);
    if (receipt.status !== DocumentStatus.CONFIRMED)
      throw new ErpException(
        'INVALID_STATUS',
        'Only CONFIRMED can be cancelled',
      );
    if (!reason)
      throw new ErpException('REASON_REQUIRED', 'Cancellation reason required');

    const session = await this.model.db.startSession();
    session.startTransaction();

    try {
      receipt.status = DocumentStatus.CANCELLED;
      receipt.cancelledBy = 'currentUserId';
      receipt.cancelledAt = new Date();
      receipt.cancellationReason = reason;

      await receipt.save({ session });
      await session.commitTransaction();
      return receipt;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findOne(id: string) {
    const receipt = await this.model.findById(id);
    if (!receipt) throw new ErpException('NOT_FOUND', 'Receipt not found');
    return receipt;
  }

  async findAll() {
    return this.model.find();
  }
}
