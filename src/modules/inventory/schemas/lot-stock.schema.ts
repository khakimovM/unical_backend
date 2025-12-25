import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class LotStock extends Document {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  warehouseId: string;

  @Prop({ required: true })
  lotCode: string;

  @Prop({ default: 0 })
  quantity: number;

  @Prop()
  receiptId?: string;
}

export const LotStockSchema = SchemaFactory.createForClass(LotStock);
LotStockSchema.index(
  { productId: 1, warehouseId: 1, lotCode: 1 },
  { unique: true },
);
