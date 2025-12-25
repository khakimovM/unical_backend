import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ExpirableStock extends Document {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  warehouseId: string;

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({ default: 0 })
  quantity: number;

  @Prop()
  receiptId?: string;
}

export const ExpirableStockSchema =
  SchemaFactory.createForClass(ExpirableStock);
ExpirableStockSchema.index(
  { productId: 1, warehouseId: 1, expirationDate: 1 },
  { unique: true },
);
ExpirableStockSchema.index({ expirationDate: 1 });
