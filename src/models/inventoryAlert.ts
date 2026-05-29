import mongoose, { Model } from 'mongoose';

export interface InventoryAlertType {
  _id: string;
  userId: string;
  itemId: mongoose.Types.ObjectId;
  itemName: string;
  alertType: 'low-stock' | 'expiry-7days' | 'expiry-3days' | 'expiry-1day' | 'expired';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    alertType: {
      type: String,
      enum: ['low-stock', 'expiry-7days', 'expiry-3days', 'expiry-1day', 'expired'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

inventoryAlertSchema.index({ userId: 1, read: 1 });
inventoryAlertSchema.index({ userId: 1, createdAt: -1 });

const InventoryAlert: Model<InventoryAlertType> =
  mongoose.models.InventoryAlert ||
  mongoose.model<InventoryAlertType>('InventoryAlert', inventoryAlertSchema);

export default InventoryAlert;
