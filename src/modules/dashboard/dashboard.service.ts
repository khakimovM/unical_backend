import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale } from '../sale/schemas/sale.schema';
import { PurchaseReceipt } from '../purchase-receipt/schemas/purchase-receipt.schema';
import { StockSummary } from '../inventory/schemas/stock-summary.schema';
import { Product } from '../product/schemas/product.schema';
import { DocumentStatus } from '../../common/enums/document-status.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<Sale>,
    @InjectModel(PurchaseReceipt.name)
    private receiptModel: Model<PurchaseReceipt>,
    @InjectModel(StockSummary.name) private stockModel: Model<StockSummary>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async salesSummary(warehouseId?: string, from?: string, to?: string) {
    const match: any = { status: DocumentStatus.CONFIRMED };
    if (warehouseId) match.warehouseId = warehouseId;
    if (from || to) {
      match.saleDate = {};
      if (from) match.saleDate.$gte = new Date(from);
      if (to) match.saleDate.$lte = new Date(to);
    }

    const [summary] = await this.saleModel.aggregate([
      { $match: match },
      { $unwind: '$lines' },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: { $multiply: ['$lines.quantity', '$lines.unitPrice'] },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          totalSalesAmount: '$totalAmount',
          salesCount: '$count',
          averageSaleValue: { $divide: ['$totalAmount', '$count'] },
        },
      },
    ]);

    return (
      summary || { totalSalesAmount: 0, salesCount: 0, averageSaleValue: 0 }
    );
  }

  async dailySales(warehouseId?: string) {
    const match: any = { status: DocumentStatus.CONFIRMED };
    if (warehouseId) match.warehouseId = warehouseId;

    return this.saleModel.aggregate([
      { $match: match },
      { $unwind: '$lines' },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
          totalAmount: {
            $sum: { $multiply: ['$lines.quantity', '$lines.unitPrice'] },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', totalAmount: 1, count: 1, _id: 0 } },
    ]);
  }

  async topProducts(limit: number) {
    return this.saleModel.aggregate([
      { $match: { status: DocumentStatus.CONFIRMED } },
      { $unwind: '$lines' },
      {
        $group: {
          _id: '$lines.productId',
          qty: { $sum: '$lines.quantity' },
          revenue: {
            $sum: { $multiply: ['$lines.quantity', '$lines.unitPrice'] },
          },
        },
      },
      { $sort: { qty: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          productName: '$product.name',
          qty: 1,
          revenue: 1,
        },
      },
    ]);
  }

  async inventorySummary(warehouseId?: string) {
    const match: any = {};
    if (warehouseId) match.warehouseId = warehouseId;

    const [summary] = await this.stockModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
        },
      },
    ]);

    const lowStock = await this.productModel.aggregate([
      { $match: { isActive: true, minStockLevel: { $gt: 0 } } },
      {
        $lookup: {
          from: 'stocksummaries',
          localField: '_id',
          foreignField: 'productId',
          as: 'stock',
          pipeline: warehouseId ? [{ $match: { warehouseId } }] : [],
        },
      },
      { $unwind: { path: '$stock', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { 'stock.quantity': { $lt: '$minStockLevel' } },
            { 'stock.quantity': null },
          ],
        },
      },
    ]);

    const totalSKUs = await this.productModel.countDocuments({
      isActive: true,
    });

    return {
      totalSKUs,
      totalStockQuantity: summary?.totalQuantity || 0,
      lowStockList: lowStock.map((p) => ({
        product: p.name,
        currentQty: p.stock?.quantity || 0,
        minLevel: p.minStockLevel,
      })),
    };
  }

  async purchaseSummary(warehouseId?: string) {
    const match: any = { status: DocumentStatus.CONFIRMED };
    if (warehouseId) match.warehouseId = warehouseId;

    const [summary] = await this.receiptModel.aggregate([
      { $match: match },
      { $unwind: '$lines' },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: { $multiply: ['$lines.quantity', '$lines.unitPrice'] },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      totalReceivedAmount: summary?.totalAmount || 0,
      receiptCount: summary?.count || 0,
    };
  }
}
