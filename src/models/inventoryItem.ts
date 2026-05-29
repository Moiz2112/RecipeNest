import mongoose, { Model } from 'mongoose';

export interface InventoryItemType {
  _id: string;
  userId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minimumThreshold: number;
  purchaseDate: Date;
  expiryDate: Date;
  location: string;
  price: number;
  barcode?: string;
  notes?: string;
  image?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const inventoryItemSchema = new mongoose.Schema(
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
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'g', 'L', 'ml', 'pieces', 'dozen', 'pack', 'box', 'bottle', 'can', 'jar', 'cup', 'tbsp', 'tsp', 'oz', 'lb'],
      default: 'pieces',
    },
    minimumThreshold: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      enum: ['Pantry', 'Refrigerator', 'Freezer', 'Kitchen Shelf', 'Other'],
      default: 'Pantry',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    barcode: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: ['in-stock', 'low-stock', 'out-of-stock', 'expired'],
      default: 'in-stock',
    },
  },
  { timestamps: true }
);

// Create index for userId and category for faster queries
inventoryItemSchema.index({ userId: 1, category: 1 });
inventoryItemSchema.index({ userId: 1, expiryDate: 1 });
inventoryItemSchema.index({ userId: 1, status: 1 });

const InventoryItem: Model<InventoryItemType> =
  mongoose.models.InventoryItem ||
  mongoose.model<InventoryItemType>('InventoryItem', inventoryItemSchema);

export default InventoryItem;
