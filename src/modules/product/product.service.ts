import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ErpException } from '../../common/exceptions/erp.exception';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(dto: CreateProductDto) {
    const exists = await this.productModel.findOne({ sku: dto.sku });
    if (exists) throw new ErpException('SKU_EXISTS', 'SKU already exists');

    const product = new this.productModel(dto);
    return product.save();
  }

  async findAll(pagination: PaginationDto) {
    let { page, limit } = pagination;

    if (!page) {
      page = 1;
    }

    if (!limit) {
      limit = 20;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.productModel.find({ isActive: true }).skip(skip).limit(limit).lean(),
      this.productModel.countDocuments({ isActive: true }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id);
    if (!product || !product.isActive)
      throw new ErpException('NOT_FOUND', 'Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (dto.trackingType && dto.trackingType !== product.trackingType) {
      const used = await this.isProductUsedInConfirmedDocs(id);
      if (used)
        throw new ErpException(
          'TRACKING_IMMUTABLE',
          'Cannot change tracking type after use',
        );
    }

    // SKU o‘zgarmas (tavsiya)
    if (dto.sku && dto.sku !== product.sku) {
      throw new ErpException('SKU_IMMUTABLE', 'SKU cannot be changed');
    }

    Object.assign(product, dto);
    return product.save();
  }

  async softDelete(id: string) {
    const product = await this.findOne(id);

    const used = await this.isProductUsedInConfirmedDocs(id);
    if (used)
      throw new ErpException('CANNOT_DELETE', 'Product used in documents');

    product.isActive = false;
    return product.save();
  }

  private async isProductUsedInConfirmedDocs(
    productId: string,
  ): Promise<boolean> {
    return false;
  }

  async validateProductForTransaction(productId: string) {
    const product = await this.productModel.findById(productId);
    if (!product || !product.isActive)
      throw new ErpException('INVALID_PRODUCT', 'Invalid or inactive product');
    if (product.isVariantParent)
      throw new ErpException(
        'PARENT_FORBIDDEN',
        'Variant parent cannot be used',
      );
    return product;
  }
}
