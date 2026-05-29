import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import InventoryCategory from '../../../models/inventoryCategory';
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
      const categories = await InventoryCategory.find({ userId })
        .sort({ name: 1 })
        .lean();

      return res.status(200).json({ data: categories, count: categories.length });
    }

    if (req.method === 'POST') {
      const { name, icon, color } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      const newCategory = new InventoryCategory({
        userId,
        name,
        icon: icon || '📦',
        color: color || '#f59e0b'
      });

      await newCategory.save();
      return res.status(201).json({ data: newCategory });
    }

    if (req.method === 'PUT') {
      const { id, name, icon, color } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }

      const category = await InventoryCategory.findOne({ _id: id, userId });
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      if (name !== undefined) category.name = name;
      if (icon !== undefined) category.icon = icon;
      if (color !== undefined) category.color = color;

      await category.save();
      return res.status(200).json({ data: category });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }

      await InventoryCategory.deleteOne({ _id: id, userId });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[inventory/categories]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default apiMiddleware(['GET', 'POST', 'PUT', 'DELETE'], handler);
