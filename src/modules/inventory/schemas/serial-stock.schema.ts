import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SerialStock extends Document {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  warehouseId: string;

  @Prop({ required: true })
  serial: string;

  @Prop({ default: 'AVAILABLE' })
  status: string; // AVAILABLE | SOLD

  @Prop()
  receiptId?: string;

  @Prop()
  saleId?: string;
}

export const SerialStockSchema = SchemaFactory.createForClass(SerialStock);
SerialStockSchema.index({ serial: 1 }, { unique: true });
SerialStockSchema.index({ productId: 1, serial: 1 }, { unique: true });
