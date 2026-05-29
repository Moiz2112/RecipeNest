import mongoose, { Model } from 'mongoose';

export interface InventoryCategoryType {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryCategorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    icon: {
      type: String,
      required: true,
      default: '📦',
    },
    color: {
      type: String,
      required: true,
      default: '#f59e0b',
    },
  },
  { timestamps: true }
);

inventoryCategorySchema.index({ userId: 1 });

const InventoryCategory: Model<InventoryCategoryType> =
  mongoose.models.InventoryCategory ||
  mongoose.model<InventoryCategoryType>('InventoryCategory', inventoryCategorySchema);

export default InventoryCategory;
