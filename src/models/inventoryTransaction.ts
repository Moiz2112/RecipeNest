import mongoose, { Model } from 'mongoose';

export interface InventoryTransactionType {
  _id: string;
  itemId: mongoose.Types.ObjectId;
  userId: string;
  type: 'add' | 'update' | 'consume' | 'delete' | 'recipe-deduction';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  source: string;
  createdAt: Date;
}

const inventoryTransactionSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['add', 'update', 'consume', 'delete', 'recipe-deduction'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

inventoryTransactionSchema.index({ userId: 1, createdAt: -1 });
inventoryTransactionSchema.index({ itemId: 1 });

const InventoryTransaction: Model<InventoryTransactionType> =
  mongoose.models.InventoryTransaction ||
  mongoose.model<InventoryTransactionType>('InventoryTransaction', inventoryTransactionSchema);

export default InventoryTransaction;
