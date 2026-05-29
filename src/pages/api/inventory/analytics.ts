import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import InventoryItem from '../../../models/inventoryItem';
import InventoryTransaction from '../../../models/inventoryTransaction';
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

    const allItems = await InventoryItem.find({ userId }).lean();
    
    // Get all transactions for the user
    const transactions = await InventoryTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // Most used ingredients (by transaction count)
    const itemConsumption: { [key: string]: number } = {};
    transactions
      .filter(tx => ['consume', 'recipe-deduction'].includes(tx.type))
      .forEach(tx => {
        const itemId = tx.itemId.toString();
        itemConsumption[itemId] = (itemConsumption[itemId] || 0) + 1;
      });

    const mostUsedIngredients = Object.entries(itemConsumption)
      .map(([itemId, count]) => {
        const item = allItems.find(i => i._id.toString() === itemId);
        return { name: item?.name || 'Unknown', count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Least used ingredients
    const leastUsedIngredients = Object.entries(itemConsumption)
      .map(([itemId, count]) => {
        const item = allItems.find(i => i._id.toString() === itemId);
        return { name: item?.name || 'Unknown', count };
      })
      .sort((a, b) => a.count - b.count)
      .slice(0, 10);

    // Inventory value trend (monthly)
    const monthlyValue: { [key: string]: number } = {};
    allItems.forEach(item => {
      const date = new Date(item.createdAt).toISOString().split('T')[0];
      monthlyValue[date] = (monthlyValue[date] || 0) + (item.price * item.quantity);
    });

    // Waste analysis (expired items)
    const expiredItems = allItems
      .filter(item => new Date(item.expiryDate) < new Date())
      .map(item => ({
        name: item.name,
        value: item.price * item.quantity,
        expiryDate: item.expiryDate
      }));

    const wasteValue = expiredItems.reduce((sum, item) => sum + item.value, 0);

    // Consumption trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const consumptionTrend: { [key: string]: number } = {};
    
    transactions
      .filter(tx => tx.createdAt > thirtyDaysAgo && ['consume', 'recipe-deduction'].includes(tx.type))
      .forEach(tx => {
        const date = new Date(tx.createdAt).toISOString().split('T')[0];
        consumptionTrend[date] = (consumptionTrend[date] || 0) + tx.quantity;
      });

    // Monthly statistics
    const monthlyAdditions: { [key: string]: number } = {};
    const monthlyConsumptions: { [key: string]: number } = {};

    transactions
      .filter(tx => tx.createdAt > thirtyDaysAgo)
      .forEach(tx => {
        const month = new Date(tx.createdAt).toISOString().substring(0, 7);
        if (['add', 'update'].includes(tx.type)) {
          monthlyAdditions[month] = (monthlyAdditions[month] || 0) + tx.quantity;
        }
        if (['consume', 'recipe-deduction'].includes(tx.type)) {
          monthlyConsumptions[month] = (monthlyConsumptions[month] || 0) + tx.quantity;
        }
      });

    // Total spending
    const totalSpending = allItems.reduce((sum, item) => sum + item.price, 0);

    return res.status(200).json({
      mostUsedIngredients,
      leastUsedIngredients,
      monthlyValue,
      expiredItems,
      wasteValue,
      consumptionTrend,
      monthlyAdditions,
      monthlyConsumptions,
      totalSpending,
      totalTransactions: transactions.length
    });
  } catch (error) {
    console.error('[inventory/analytics]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default apiMiddleware(['GET'], handler);
