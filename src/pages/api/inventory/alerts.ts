import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import InventoryAlert from '../../../models/inventoryAlert';
import { apiMiddleware } from '../../../lib/apiMiddleware';

const handler = async (req: NextApiRequest, res: NextApiResponse, session?: any) => {
  try {
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();
    const userId = session.user.id;

    if (req.method === 'GET') {
      const { read } = req.query;
      const filter: any = { userId };

      if (read === 'true') filter.read = true;
      if (read === 'false') filter.read = false;

      const alerts = await InventoryAlert.find(filter)
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({ data: alerts, count: alerts.length });
    }

    if (req.method === 'PUT') {
      // Mark alert as read
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Missing alert ID' });
      }

      await InventoryAlert.updateOne(
        { _id: id, userId },
        { read: true }
      );

      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      // Delete alert
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Missing alert ID' });
      }

      await InventoryAlert.deleteOne({ _id: id, userId });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[inventory/alerts]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default apiMiddleware(['GET', 'PUT', 'DELETE'], handler);
