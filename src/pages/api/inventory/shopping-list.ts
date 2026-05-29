import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import ShoppingList from '../../../models/shoppingList';
import InventoryItem from '../../../models/inventoryItem';
import { apiMiddleware } from '../../../lib/apiMiddleware';
import mongoose from 'mongoose';

const handler = async (req: NextApiRequest, res: NextApiResponse, session?: any) => {
  try {
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();
    const userId = session.user.id;

    if (req.method === 'GET') {
      const { completed } = req.query;
      const filter: any = { userId };

      if (completed === 'true') filter.completed = true;
      if (completed === 'false') filter.completed = false;

      const items = await ShoppingList.find(filter)
        .sort({ priority: -1, createdAt: -1 })
        .lean();

      return res.status(200).json({ data: items, count: items.length });
    }

    if (req.method === 'POST') {
      // Generate or add to shopping list
      const { action, itemName, quantity, unit, priority, fromLowStock } = req.body;

      if (action === 'auto-generate') {
        // Auto-generate from low stock items
        const lowStockItems = await InventoryItem.find({
          userId,
          status: 'low-stock'
        }).lean();

        const shoppingItems = lowStockItems.map(item => ({
          userId,
          itemName: item.name,
          quantity: item.minimumThreshold * 2,
          unit: item.unit,
          priority: 'high',
          completed: false
        }));

        await ShoppingList.insertMany(shoppingItems);
        return res.status(201).json({ data: shoppingItems });
      }

      if (action === 'add') {
        // Add single item
        if (!itemName) {
          return res.status(400).json({ error: 'Item name is required' });
        }

        const newItem = new ShoppingList({
          userId,
          itemName,
          quantity: quantity || 1,
          unit: unit || 'pieces',
          priority: priority || 'medium',
          completed: false
        });

        await newItem.save();
        return res.status(201).json({ data: newItem });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    if (req.method === 'PUT') {
      // Update shopping list item
      const { id, completed, quantity, priority } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json({ error: 'Invalid item ID' });
      }

      const item = await ShoppingList.findOne({ _id: id, userId });
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      if (completed !== undefined) item.completed = completed;
      if (quantity !== undefined) item.quantity = quantity;
      if (priority !== undefined) item.priority = priority;

      await item.save();
      return res.status(200).json({ data: item });
    }

    if (req.method === 'DELETE') {
      // Delete shopping list item
      const { id } = req.query;

      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json({ error: 'Invalid item ID' });
      }

      await ShoppingList.deleteOne({ _id: id, userId });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[inventory/shopping-list]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default apiMiddleware(['GET', 'POST', 'PUT', 'DELETE'], handler);
