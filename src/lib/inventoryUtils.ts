import InventoryItem from '../models/inventoryItem';
import InventoryAlert from '../models/inventoryAlert';
import InventoryTransaction from '../models/inventoryTransaction';

export async function deductIngredientsFromRecipe(userId: any, recipeIngredients: Array<{name:string,quantity:number,unit?:string}>, recipeId?: string) {
  const txs: any[] = [];
  for (const ing of recipeIngredients) {
    // Find matching item by name (case-insensitive)
    const item = await InventoryItem.findOne({ userId, name: { $regex: `^${ing.name}$`, $options: 'i' } });
    if (!item) continue;

    const previousQuantity = item.quantity;
    const newQuantity = Math.max(0, item.quantity - (ing.quantity || 1));
    item.quantity = newQuantity;

    // Update status
    if (newQuantity === 0) item.status = 'out-of-stock';
    else if (newQuantity <= item.minimumThreshold) item.status = 'low-stock';
    else item.status = 'in-stock';

    await item.save();

    await InventoryTransaction.create({
      itemId: item._id,
      userId,
      type: recipeId ? 'recipe-deduction' : 'consume',
      quantity: ing.quantity || 1,
      previousQuantity,
      newQuantity,
      source: recipeId ? `Recipe #${recipeId}` : 'Recipe cook'
    });

    // Create low-stock alert if needed
    if (newQuantity <= item.minimumThreshold && newQuantity > 0) {
      const existingAlert = await InventoryAlert.findOne({ itemId: item._id, userId, alertType: 'low-stock', read: false });
      if (!existingAlert) {
        await InventoryAlert.create({
          userId,
          itemId: item._id,
          itemName: item.name,
          alertType: 'low-stock',
          severity: 'warning',
          message: `${item.name} is running low. Only ${newQuantity} ${item.unit} remaining.`
        });
      }
    }

    txs.push({ itemId: item._id, previousQuantity, newQuantity });
  }

  return txs;
}
