import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Sale } from './schemas/sale.schema';
import { CreateSaleDto } from './dto/create-sale.dto';
import { DocumentStatus } from '../../common/enums/document-status.enum';
import { InventoryService } from '../inventory/inventory.service';
import { ErpException } from '../../common/exceptions/erp.exception';

@Injectable()
export class SaleService {
  constructor(
    @InjectModel(Sale.name) private model: Model<Sale>,
    private inventoryService: InventoryService,
  ) {}

  async create(dto: CreateSaleDto) {
    const sale = new this.model({
      ...dto,
      status: DocumentStatus.DRAFT,
      createdBy: 'currentUserId',
    });
    return sale.save();
  }

  async confirm(id: string) {
    const sale = await this.findOne(id);
    if (sale.status !== DocumentStatus.DRAFT)
      throw new ErpException('INVALID_STATUS', 'Only DRAFT can be confirmed');

    const session = await this.model.db.startSession();
    session.startTransaction();

    try {
      await this.inventoryService.decreaseStock(
        sale.lines,
        sale.warehouseId,
        sale._id.toString(),
        session,
      );

      sale.status = DocumentStatus.CONFIRMED;
      sale.confirmedBy = 'currentUserId';
      sale.confirmedAt = new Date();

      await sale.save({ session });
      await session.commitTransaction();
      return sale;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async cancel(id: string, reason: string) {
    const sale = await this.findOne(id);
    if (sale.status !== DocumentStatus.CONFIRMED)
      throw new ErpException(
        'INVALID_STATUS',
        'Only CONFIRMED can be cancelled',
      );
    if (!reason)
      throw new ErpException('REASON_REQUIRED', 'Cancellation reason required');

    const session = await this.model.db.startSession();
    session.startTransaction();

    try {
      sale.status = DocumentStatus.CANCELLED;
      sale.cancelledBy = 'currentUserId';
      sale.cancelledAt = new Date();
      sale.cancellationReason = reason;

      await sale.save({ session });
      await session.commitTransaction();
      return sale;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findOne(id: string) {
    const sale = await this.model.findById(id);
    if (!sale) throw new ErpException('NOT_FOUND', 'Sale not found');
    return sale;
  }

  async findAll() {
    return this.model.find();
  }
}
