import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DocumentStatus } from 'src/common/enums/document-status.enum';

@Schema()
export class SaleLine {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop()
  expirationDate?: Date;

  @Prop()
  lotCode?: string;

  @Prop({ type: [String], default: [] })
  serialNumbers: string[];
}

export const SaleLineSchema = SchemaFactory.createForClass(SaleLine);

@Schema({ timestamps: true })
export class Sale extends Document {
  @Prop()
  customerId?: string;

  @Prop({ required: true })
  warehouseId: string;

  @Prop({ required: true })
  saleDate: Date;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop()
  paymentType?: string;

  @Prop()
  comment?: string;

  @Prop({ type: String, enum: DocumentStatus, default: DocumentStatus.DRAFT })
  status: DocumentStatus;

  @Prop({ type: [SaleLineSchema], default: [] })
  lines: SaleLine[];

  // Audit
  @Prop()
  createdBy?: string;

  @Prop()
  confirmedBy?: string;

  @Prop()
  confirmedAt?: Date;

  @Prop()
  cancelledBy?: string;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  cancellationReason?: string;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);

SaleSchema.index({ status: 1 });
SaleSchema.index({ warehouseId: 1 });
SaleSchema.index({ saleDate: 1 });
