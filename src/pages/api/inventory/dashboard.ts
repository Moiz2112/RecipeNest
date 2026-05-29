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

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get all items
    const allItems = await InventoryItem.find({ userId }).lean();
    
    // Calculate statistics
    const stats = {
      totalItems: allItems.length,
      totalValue: allItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      lowStockCount: allItems.filter(item => item.quantity <= item.minimumThreshold).length,
      expiringSoon: allItems.filter(item => {
        const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
      }).length,
      expiredCount: allItems.filter(item => new Date(item.expiryDate) < new Date()).length,
      totalCategories: 0,
    };

    // Get unique categories
    const categories = [...new Set(allItems.map(item => item.category))];
    stats.totalCategories = categories.length;

    // Get category breakdown
    const categoryBreakdown = categories.map(cat => {
      const categoryItems = allItems.filter(item => item.category === cat);
      return {
        name: cat,
        count: categoryItems.length,
        value: categoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
    });

    // Get monthly consumption (from transactions in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const transactions = await InventoryTransaction.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo }
    }).lean();

    // Group transactions by day
    const dailyConsumption: { [key: string]: number } = {};
    transactions.forEach(tx => {
      const date = new Date(tx.createdAt).toISOString().split('T')[0];
      dailyConsumption[date] = (dailyConsumption[date] || 0) + 1;
    });

    // Get expiry timeline
    const expiryTimeline = allItems
      .filter(item => new Date(item.expiryDate) > new Date())
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
      .slice(0, 10)
      .map(item => ({
        name: item.name,
        expiryDate: item.expiryDate,
        daysLeft: Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
      }));

    // Get alerts
    const alerts = await InventoryAlert.find({ userId, read: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get recent activity
    const recentActivity = await InventoryTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get low stock items
    const lowStockItems = allItems
      .filter(item => item.quantity <= item.minimumThreshold)
      .slice(0, 5);

    return res.status(200).json({
      stats,
      categoryBreakdown,
      dailyConsumption,
      expiryTimeline,
      alerts,
      recentActivity,
      lowStockItems
    });
  } catch (error) {
    console.error('[inventory/dashboard]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default apiMiddleware(['GET'], handler);
