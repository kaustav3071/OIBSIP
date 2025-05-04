import Inventory from '../models/inventories.model.js'; // Assuming you have an Inventory model defined in models/inventories.model.js

// Helper function to get or create the single inventory document
const getInventoryDocument = async () => {
  let inventory = await Inventory.findOne();
  if (!inventory) {
    inventory = new Inventory({});
    await inventory.save();
  }
  return inventory;
};

// Get the entire inventory
export const getInventory = async (req, res) => {
  try {
    const inventory = await getInventoryDocument();
    return res.status(200).json(inventory);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching inventory', error: error.message });
  }
};

// Update inventory (e.g., add or modify bases, sauces, cheeses, veggies)
export const updateInventory = async (req, res) => {
  try {
    const { bases, sauces, cheeses, veggies } = req.body;

    const inventory = await getInventoryDocument();

    // Update the fields if provided in the request
    if (bases) inventory.bases = new Map(Object.entries(bases));
    if (sauces) inventory.sauces = new Map(Object.entries(sauces));
    if (cheeses) inventory.cheeses = new Map(Object.entries(cheeses));
    if (veggies) inventory.veggies = new Map(Object.entries(veggies));

    await inventory.save();
    return res.status(200).json({ message: 'Inventory updated successfully', inventory });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating inventory', error: error.message });
  }
};

// Check for low stock (threshold: 20)
export const checkLowStock = async (req, res) => {
  try {
    const threshold = 20;
    const inventory = await getInventoryDocument();

    const lowStockItems = {
      bases: [],
      sauces: [],
      cheeses: [],
      veggies: []
    };

    // Check bases
    for (const [name, details] of inventory.bases) {
      if (details.qty < threshold) {
        lowStockItems.bases.push({ name, qty: details.qty });
      }
    }

    // Check sauces
    for (const [name, details] of inventory.sauces) {
      if (details.qty < threshold) {
        lowStockItems.sauces.push({ name, qty: details.qty });
      }
    }

    // Check cheeses
    for (const [name, details] of inventory.cheeses) {
      if (details.qty < threshold) {
        lowStockItems.cheeses.push({ name, qty: details.qty });
      }
    }

    // Check veggies
    for (const [name, details] of inventory.veggies) {
      if (details.qty < threshold) {
        lowStockItems.veggies.push({ name, qty: details.qty });
      }
    }

    return res.status(200).json({ message: 'Low stock check complete', lowStockItems });
  } catch (error) {
    return res.status(500).json({ message: 'Error checking low stock', error: error.message });
  }
};

// Reduce stock after an order (e.g., when a pizza is ordered)
export const reduceStock = async (req, res) => {
  try {
    const { base, sauce, cheese, veggies } = req.body; // Expected: { base: "Thin Crust", sauce: "Marinara", cheese: "Mozzarella", veggies: ["Onions", "Peppers"] }

    const inventory = await getInventoryDocument();

    // Reduce stock for base
    if (base && inventory.bases.has(base)) {
      const baseDetails = inventory.bases.get(base);
      if (baseDetails.qty <= 0) {
        return res.status(400).json({ message: `Base ${base} is out of stock` });
      }
      baseDetails.qty -= 1;
      inventory.bases.set(base, baseDetails);
    }

    // Reduce stock for sauce
    if (sauce && inventory.sauces.has(sauce)) {
      const sauceDetails = inventory.sauces.get(sauce);
      if (sauceDetails.qty <= 0) {
        return res.status(400).json({ message: `Sauce ${sauce} is out of stock` });
      }
      sauceDetails.qty -= 1;
      inventory.sauces.set(sauce, sauceDetails);
    }

    // Reduce stock for cheese
    if (cheese && inventory.cheeses.has(cheese)) {
      const cheeseDetails = inventory.cheeses.get(cheese);
      if (cheeseDetails.qty <= 0) {
        return res.status(400).json({ message: `Cheese ${cheese} is out of stock` });
      }
      cheeseDetails.qty -= 1;
      inventory.cheeses.set(cheese, cheeseDetails);
    }

    // Reduce stock for veggies
    if (veggies && Array.isArray(veggies)) {
      for (const veggie of veggies) {
        if (inventory.veggies.has(veggie)) {
          const veggieDetails = inventory.veggies.get(veggie);
          if (veggieDetails.qty <= 0) {
            return res.status(400).json({ message: `Veggie ${veggie} is out of stock` });
          }
          veggieDetails.qty -= 1;
          inventory.veggies.set(veggie, veggieDetails);
        }
      }
    }

    await inventory.save();
    return res.status(200).json({ message: 'Stock updated successfully', inventory });
  } catch (error) {
    return res.status(500).json({ message: 'Error reducing stock', error: error.message });
  }
};