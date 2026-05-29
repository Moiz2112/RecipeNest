import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import InventoryItem from '../../../models/inventoryItem';
import InventoryAlert from '../../../models/inventoryAlert';
import InventoryTransaction from '../../../models/inventoryTransaction';
import { apiMiddleware } from '../../../lib/apiMiddleware';

const handler = async (req: NextApiRequest, res: NextApiResponse, session?: any) => {
  try {
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();
    const userId = session.user.id;

    if (req.method === 'GET') {
      // Get all inventory items for user
      const { category, location, status, search } = req.query;
      const filter: any = { userId };

      if (category) filter.category = category;
      if (location) filter.location = location;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ];
      }

      const items = await InventoryItem.find(filter)
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({ data: items, count: items.length });
    }

    if (req.method === 'POST') {
      // Add new inventory item
      const {
        name,
        category,
        quantity,
        unit,
        minimumThreshold,
        purchaseDate,
        expiryDate,
        location,
        price,
        barcode,
        notes,
        image
      } = req.body;

      // Validate required fields
      if (!name || !category || !expiryDate || !location) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newItem = new InventoryItem({
        userId,
        name,
        category,
        quantity: quantity || 1,
        unit: unit || 'pieces',
        minimumThreshold: minimumThreshold || 1,
        purchaseDate: purchaseDate || new Date(),
        expiryDate: new Date(expiryDate),
        location,
        price: price || 0,
        barcode,
        notes,
        image,
        status: quantity <= (minimumThreshold || 1) ? 'low-stock' : 'in-stock'
      });

      await newItem.save();

      // Create transaction log
      await InventoryTransaction.create({
        itemId: newItem._id,
        userId,
        type: 'add',
        quantity,
        previousQuantity: 0,
        newQuantity: quantity,
        source: 'Manual addition'
      });

      return res.status(201).json({ data: newItem });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[inventory]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default apiMiddleware(['GET', 'POST'], handler);
