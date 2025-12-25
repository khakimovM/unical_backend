import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class StockSummary extends Document {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  warehouseId: string;

  @Prop({ default: 0 })
  quantity: number;
}

export const StockSummarySchema = SchemaFactory.createForClass(StockSummary);
StockSummarySchema.index({ productId: 1, warehouseId: 1 }, { unique: true });
