import mongoose, { Model } from 'mongoose';

export interface ShoppingListType {
  _id: string;
  userId: string;
  itemName: string;
  quantity: number;
  unit: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const shoppingListSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },
    unit: {
      type: String,
      enum: ['kg', 'g', 'L', 'ml', 'pieces', 'dozen', 'pack', 'box', 'bottle', 'can', 'jar', 'cup', 'tbsp', 'tsp', 'oz', 'lb'],
      default: 'pieces',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

shoppingListSchema.index({ userId: 1 });
shoppingListSchema.index({ userId: 1, completed: 1 });

const ShoppingList: Model<ShoppingListType> =
  mongoose.models.ShoppingList ||
  mongoose.model<ShoppingListType>('ShoppingList', shoppingListSchema);

export default ShoppingList;
