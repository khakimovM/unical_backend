import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { StockSummary } from './schemas/stock-summary.schema';
import { SerialStock } from './schemas/serial-stock.schema';
import { LotStock } from './schemas/lot-stock.schema';
import { ExpirableStock } from './schemas/expirable-stock.schema';
import { ProductService } from '../product/product.service';
import { TrackingType } from '../../common/enums/tracking-type.enum';
import { ErpException } from '../../common/exceptions/erp.exception';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(StockSummary.name)
    private stockSummaryModel: Model<StockSummary>,
    @InjectModel(SerialStock.name) private serialModel: Model<SerialStock>,
    @InjectModel(LotStock.name) private lotModel: Model<LotStock>,
    @InjectModel(ExpirableStock.name)
    private expirableModel: Model<ExpirableStock>,
    private productService: ProductService,
  ) {}

  async increaseStock(
    lines: any[],
    warehouseId: string,
    receiptId: string,
    session: ClientSession,
  ) {
    for (const line of lines) {
      const product = await this.productService.validateProductForTransaction(
        line.productId,
      );

      await this.stockSummaryModel.findOneAndUpdate(
        { productId: line.productId, warehouseId },
        { $inc: { quantity: line.quantity } },
        { upsert: true, session },
      );

      switch (product.trackingType) {
        case TrackingType.SERIALIZED:
          if (line.serialNumbers.length !== line.quantity)
            throw new ErpException('SERIAL_COUNT', 'Serial count mismatch');
          for (const serial of line.serialNumbers) {
            const exists = await this.serialModel.findOne({ serial });
            if (exists)
              throw new ErpException(
                'SERIAL_DUPLICATE',
                'Serial already exists',
              );
            await new this.serialModel({
              productId: line.productId,
              warehouseId,
              serial,
              receiptId,
              status: 'AVAILABLE',
            }).save({ session });
          }
          break;

        case TrackingType.LOT_TRACKED:
          if (!line.lotCode)
            throw new ErpException('LOT_REQUIRED', 'Lot code required');
          await this.lotModel.findOneAndUpdate(
            { productId: line.productId, warehouseId, lotCode: line.lotCode },
            { $inc: { quantity: line.quantity }, receiptId },
            { upsert: true, session },
          );
          break;

        case TrackingType.EXPIRABLE:
          if (!line.expirationDate)
            throw new ErpException(
              'EXPIRY_REQUIRED',
              'Expiration date required',
            );
          await this.expirableModel.findOneAndUpdate(
            {
              productId: line.productId,
              warehouseId,
              expirationDate: line.expirationDate,
            },
            { $inc: { quantity: line.quantity }, receiptId },
            { upsert: true, session },
          );
          break;

        case TrackingType.SIMPLE:
        case TrackingType.VARIANT:
          break;
      }
    }
  }

  async decreaseStock(
    lines: any[],
    warehouseId: string,
    saleId: string,
    session: ClientSession,
  ) {
    for (const line of lines) {
      const product = await this.productService.validateProductForTransaction(
        line.productId,
      );

      const current = await this.stockSummaryModel.findOne({
        productId: line.productId,
        warehouseId,
      });
      if (!current || current.quantity < line.quantity)
        throw new ErpException('INSUFFICIENT_STOCK', 'Not enough stock');

      await this.stockSummaryModel.findOneAndUpdate(
        { productId: line.productId, warehouseId },
        { $inc: { quantity: -line.quantity } },
        { session },
      );

      switch (product.trackingType) {
        case TrackingType.SERIALIZED:
          if (line.serialNumbers.length !== line.quantity)
            throw new ErpException('SERIAL_COUNT', 'Serial count mismatch');
          for (const serial of line.serialNumbers) {
            const stock = await this.serialModel.findOne({
              serial,
              status: 'AVAILABLE',
              warehouseId,
            });
            if (!stock)
              throw new ErpException(
                'SERIAL_NOT_AVAILABLE',
                'Serial not available',
              );
            stock.status = 'SOLD';
            stock.saleId = saleId;
            await stock.save({ session });
          }
          break;

        case TrackingType.LOT_TRACKED:
          if (!line.lotCode)
            throw new ErpException('LOT_REQUIRED', 'Lot code required');
          const lot = await this.lotModel.findOne({
            productId: line.productId,
            warehouseId,
            lotCode: line.lotCode,
          });
          if (!lot || lot.quantity < line.quantity)
            throw new ErpException('LOT_INSUFFICIENT', 'Not enough in lot');
          lot.quantity -= line.quantity;
          await lot.save({ session });
          break;

        case TrackingType.EXPIRABLE:
          throw new ErpException(
            'NOT_IMPLEMENTED',
            'Expirable FIFO not fully implemented yet',
          );
      }
    }
  }

  async revertIncreaseStock(
    lines: any[],
    warehouseId: string,
    session: ClientSession,
  ) {}
}
