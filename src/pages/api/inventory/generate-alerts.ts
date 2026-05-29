import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import InventoryItem from '../../../models/inventoryItem';
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

    const allItems = await InventoryItem.find({ userId }).lean();
    const alertsToCreate = [];
    const now = new Date();

    for (const item of allItems) {
      const expiryDate = new Date(item.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

      // Check for low stock
      if (item.quantity <= item.minimumThreshold && item.quantity > 0) {
        const existingAlert = await InventoryAlert.findOne({
          itemId: item._id,
          userId,
          alertType: 'low-stock',
          read: false
        });

        if (!existingAlert) {
          alertsToCreate.push({
            userId,
            itemId: item._id,
            itemName: item.name,
            alertType: 'low-stock',
            severity: 'warning',
            message: `${item.name} is running low. Only ${item.quantity} ${item.unit} remaining.`
          });
        }
      }

      // Check for expired items
      if (expiryDate < now) {
        const existingAlert = await InventoryAlert.findOne({
          itemId: item._id,
          userId,
          alertType: 'expired',
          read: false
        });

        if (!existingAlert) {
          alertsToCreate.push({
            userId,
            itemId: item._id,
            itemName: item.name,
            alertType: 'expired',
            severity: 'critical',
            message: `${item.name} has expired. Please remove it from inventory.`
          });

          // Update item status to expired
          item.status = 'expired';
          await InventoryItem.updateOne({ _id: item._id }, { status: 'expired' });
        }
      }
      // Check for items expiring within 1 day
      else if (daysUntilExpiry <= 1 && daysUntilExpiry > 0) {
        const existingAlert = await InventoryAlert.findOne({
          itemId: item._id,
          userId,
          alertType: 'expiry-1day',
          read: false
        });

        if (!existingAlert) {
          alertsToCreate.push({
            userId,
            itemId: item._id,
            itemName: item.name,
            alertType: 'expiry-1day',
            severity: 'critical',
            message: `${item.name} expires today! Please use it soon.`
          });
        }
      }
      // Check for items expiring within 3 days
      else if (daysUntilExpiry <= 3 && daysUntilExpiry > 1) {
        const existingAlert = await InventoryAlert.findOne({
          itemId: item._id,
          userId,
          alertType: 'expiry-3days',
          read: false
        });

        if (!existingAlert) {
          alertsToCreate.push({
            userId,
            itemId: item._id,
            itemName: item.name,
            alertType: 'expiry-3days',
            severity: 'warning',
            message: `${item.name} expires in ${daysUntilExpiry} days.`
          });
        }
      }
      // Check for items expiring within 7 days
      else if (daysUntilExpiry <= 7 && daysUntilExpiry > 3) {
        const existingAlert = await InventoryAlert.findOne({
          itemId: item._id,
          userId,
          alertType: 'expiry-7days',
          read: false
        });

        if (!existingAlert) {
          alertsToCreate.push({
            userId,
            itemId: item._id,
            itemName: item.name,
            alertType: 'expiry-7days',
            severity: 'info',
            message: `${item.name} expires in ${daysUntilExpiry} days.`
          });
        }
      }
    }

    if (alertsToCreate.length > 0) {
      await InventoryAlert.insertMany(alertsToCreate);
    }

    return res.status(200).json({
      success: true,
      alertsCreated: alertsToCreate.length,
      message: `Created ${alertsToCreate.length} new alerts`
    });
  } catch (error) {
    console.error('[inventory/generate-alerts]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default apiMiddleware(['POST'], handler);
