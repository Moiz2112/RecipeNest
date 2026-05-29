import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import InventoryItem from '../../../models/inventoryItem';
import InventoryTransaction from '../../../models/inventoryTransaction';
import InventoryAlert from '../../../models/inventoryAlert';
import { apiMiddleware } from '../../../lib/apiMiddleware';

const handler = async (req: NextApiRequest, res: NextApiResponse, session?: any) => {
  try {
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();
    const userId = session.user.id;

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { itemId, quantity, recipeId } = req.body;

    if (!itemId || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the item
    const item = await InventoryItem.findOne({ _id: itemId, userId });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const previousQuantity = item.quantity;
    const newQuantity = Math.max(0, item.quantity - quantity);

    // Update item quantity
    item.quantity = newQuantity;

    // Update status
    if (newQuantity === 0) {
      item.status = 'out-of-stock';
    } else if (newQuantity <= item.minimumThreshold) {
      item.status = 'low-stock';
    } else {
      item.status = 'in-stock';
    }

    await item.save();

    // Create transaction
    await InventoryTransaction.create({
      itemId,
      userId,
      type: recipeId ? 'recipe-deduction' : 'consume',
      quantity,
      previousQuantity,
      newQuantity,
      source: recipeId ? `Recipe #${recipeId}` : 'Manual consumption'
    });

    // Check if low stock alert should be created
    if (newQuantity <= item.minimumThreshold && newQuantity > 0) {
      const existingAlert = await InventoryAlert.findOne({
        itemId,
        userId,
        alertType: 'low-stock',
        read: false
      });

      if (!existingAlert) {
        await InventoryAlert.create({
          userId,
          itemId,
          itemName: item.name,
          alertType: 'low-stock',
          severity: 'warning',
          message: `${item.name} is running low. Only ${newQuantity} ${item.unit} remaining.`,
          read: false
        });
      }
    }

    return res.status(200).json({ 
      data: item,
      message: `Consumed ${quantity} ${item.unit} of ${item.name}`
    });
  } catch (error) {
    console.error('[inventory/consume]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default apiMiddleware(['POST'], handler);
