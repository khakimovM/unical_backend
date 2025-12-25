import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TrackingType } from '../../common/enums/tracking-type.enum';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ required: true })
  unitOfMeasure: string;

  @Prop({ type: String, enum: TrackingType, required: true })
  trackingType: TrackingType;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  barcode?: string;

  @Prop()
  minStockLevel?: number;

  @Prop()
  salePriceDefault?: number;

  @Prop()
  purchasePriceDefault?: number;

  // Variant uchun
  @Prop({ default: false })
  isVariantParent: boolean;

  @Prop({ type: Object })
  variantAttributes?: Record<string, any>;

  @Prop()
  parentId?: string; // variant bo‘lsa parent SKU yoki ID

  // Audit
  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ sku: 1 }, { unique: true });
