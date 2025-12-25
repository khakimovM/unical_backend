import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DocumentStatus } from 'src/common/enums/document-status.enum';

@Schema()
export class PurchaseLine {
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

export const PurchaseLineSchema = SchemaFactory.createForClass(PurchaseLine);

@Schema({ timestamps: true })
export class PurchaseReceipt extends Document {
  @Prop({ required: true })
  supplierId: string;

  @Prop({ required: true })
  warehouseId: string;

  @Prop({ required: true })
  receiptDate: Date;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop()
  invoiceNumber?: string;

  @Prop()
  comment?: string;

  @Prop({ type: String, enum: DocumentStatus, default: DocumentStatus.DRAFT })
  status: DocumentStatus;

  @Prop({ type: [PurchaseLineSchema], default: [] })
  lines: PurchaseLine[];

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

export const PurchaseReceiptSchema =
  SchemaFactory.createForClass(PurchaseReceipt);

PurchaseReceiptSchema.index({ status: 1 });
PurchaseReceiptSchema.index({ warehouseId: 1 });
PurchaseReceiptSchema.index({ receiptDate: 1 });
