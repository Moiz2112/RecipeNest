import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import InventoryItem from '../../../models/inventoryItem';
import InventoryTransaction from '../../../models/inventoryTransaction';
import InventoryAlert from '../../../models/inventoryAlert';
import { apiMiddleware } from '../../../lib/apiMiddleware';
import mongoose from 'mongoose';

const handler = async (req: NextApiRequest, res: NextApiResponse, session?: any) => {
  try {
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();
    const userId = session.user.id;
    const { id } = req.query;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    // Verify ownership
    const item = await InventoryItem.findOne({ _id: id, userId });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({ data: item });
    }

    if (req.method === 'PUT') {
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

      const previousQuantity = item.quantity;

      // Update item
      if (name !== undefined) item.name = name;
      if (category !== undefined) item.category = category;
      if (quantity !== undefined) item.quantity = quantity;
      if (unit !== undefined) item.unit = unit;
      if (minimumThreshold !== undefined) item.minimumThreshold = minimumThreshold;
      if (purchaseDate !== undefined) item.purchaseDate = new Date(purchaseDate);
      if (expiryDate !== undefined) item.expiryDate = new Date(expiryDate);
      if (location !== undefined) item.location = location;
      if (price !== undefined) item.price = price;
      if (barcode !== undefined) item.barcode = barcode;
      if (notes !== undefined) item.notes = notes;
      if (image !== undefined) item.image = image;

      // Update status based on quantity
      if (quantity !== undefined) {
        if (quantity === 0) {
          item.status = 'out-of-stock';
        } else if (quantity <= item.minimumThreshold) {
          item.status = 'low-stock';
        } else {
          item.status = 'in-stock';
        }
      }

      // Check if expiry date is passed
      if (expiryDate && new Date(expiryDate) < new Date()) {
        item.status = 'expired';
      }

      await item.save();

      // Log transaction if quantity changed
      if (quantity !== undefined && quantity !== previousQuantity) {
        await InventoryTransaction.create({
          itemId: item._id,
          userId,
          type: 'update',
          quantity: Math.abs(quantity - previousQuantity),
          previousQuantity,
          newQuantity: quantity,
          source: 'Manual adjustment'
        });
      }

      return res.status(200).json({ data: item });
    }

    if (req.method === 'DELETE') {
      // Create a delete transaction before deleting
      await InventoryTransaction.create({
        itemId: item._id,
        userId,
        type: 'delete',
        quantity: 0,
        previousQuantity: item.quantity,
        newQuantity: 0,
        source: 'Item deleted'
      });

      // Delete related alerts
      await InventoryAlert.deleteMany({ itemId: item._id });

      // Delete the item
      await InventoryItem.deleteOne({ _id: id });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[inventory/[id]]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default apiMiddleware(['GET', 'PUT', 'DELETE'], handler);
