import Inventory from '../models/inventories.model.js';
import nodemailer from 'nodemailer';

// Setup nodemailer transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Replace with your email
    pass: process.env.EMAIL_PASS // Replace with your app-specific password
  }
});

// Helper function to get or create the single inventory document
const getInventoryDocument = async () => {
  let inventory = await Inventory.findOne();
  if (!inventory) {
    inventory = new Inventory({});
    await inventory.save();
  }
  return inventory;
};

// Helper function to generate HTML email content for low stock items
const generateLowStockEmail = (lowStockItems) => {
  const renderCategory = (categoryName, items) => {
    if (!items || items.length === 0) {
      return '';
    }
    return `
      <h2 style="font-size: 18px; color: #34495e; margin: 20px 0 10px;">${categoryName}</h2>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="background-color: #2c3e50; color: #ffffff; padding: 10px; text-align: left; font-size: 14px; border-bottom: 1px solid #ecf0f1;">Name</th>
            <th style="background-color: #2c3e50; color: #ffffff; padding: 10px; text-align: left; font-size: 14px; border-bottom: 1px solid #ecf0f1;">Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td style="padding: 10px; color: #34495e; font-size: 14px; border-bottom: 1px solid #ecf0f1;">${item.name}</td>
              <td style="padding: 10px; color: #c0392b; font-size: 14px; border-bottom: 1px solid #ecf0f1;">${item.qty}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Low Stock Alert</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="background-color: #2c3e50; border-top-left-radius: 8px; border-top-right-radius: 8px; padding: 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">Low Stock Alert</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <p style="font-size: 16px; color: #333333; margin: 0 0 20px;">Dear Admin,</p>
                  <p style="font-size: 16px; color: #333333; margin: 0 0 20px;">We have detected low stock items in the inventory (quantity below 20). Please review the details below and take action to restock the items.</p>
                  ${renderCategory("Bases", lowStockItems.bases)}
                  ${renderCategory("Sauces", lowStockItems.sauces)}
                  ${renderCategory("Cheeses", lowStockItems.cheeses)}
                  ${renderCategory("Veggies", lowStockItems.veggies)}
                  <p style="font-size: 16px; color: #333333; margin: 20px 0;">Please take action to restock these items as soon as possible.</p>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="text-align: center;">
                        <a href="http://localhost:5173/admin/inventory/update" style="display: inline-block; padding: 12px 24px; background-color: #4caf50; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">Update Inventory</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="background-color: #ecf0f1; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; padding: 15px; text-align: center;">
                  <p style="font-size: 14px; color: #7f8c8d; margin: 0;">This is an automated email from the Inventory Management System (PizzaCraft).</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Endpoint to send low stock email
export const sendLowStockEmail = async (req, res) => {
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

    // Check if there are any low stock items
    const hasLowStock = Object.values(lowStockItems).some(category => category.length > 0);
    if (!hasLowStock) {
      return res.status(200).json({ message: "No low stock items to report." });
    }

    // Generate email content
    const emailContent = generateLowStockEmail(lowStockItems);

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER, // Replace with your email
      to: 'kaustavdas758@gmail.com', // Replace with admin email
      subject: '🚨 Low Stock Alert - Action Required',
      html: emailContent
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Low stock email sent successfully.", lowStockItems });
  } catch (error) {
    return res.status(500).json({ message: "Error sending low stock email.", error: error.message });
  }
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

    for (const [name, details] of inventory.bases) {
      if (details.qty < threshold) {
        lowStockItems.bases.push({ name, qty: details.qty });
      }
    }

    for (const [name, details] of inventory.sauces) {
      if (details.qty < threshold) {
        lowStockItems.sauces.push({ name, qty: details.qty });
      }
    }

    for (const [name, details] of inventory.cheeses) {
      if (details.qty < threshold) {
        lowStockItems.cheeses.push({ name, qty: details.qty });
      }
    }

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
// Reduce stock after an order (e.g., when a pizza is ordered)
export const reduceStock = async ({ base, sauce, cheese, veggies }) => {
  try {
    const inventory = await getInventoryDocument();

    if (base && inventory.bases.has(base)) {
      const baseDetails = inventory.bases.get(base);
      if (baseDetails.qty <= 0) {
        return { status: 400, message: `Base ${base} is out of stock` };
      }
      baseDetails.qty -= 1;
      inventory.bases.set(base, baseDetails);
    }

    if (sauce && inventory.sauces.has(sauce)) {
      const sauceDetails = inventory.sauces.get(sauce);
      if (sauceDetails.qty <= 0) {
        return { status: 400, message: `Sauce ${sauce} is out of stock` };
      }
      sauceDetails.qty -= 1;
      inventory.sauces.set(sauce, sauceDetails);
    }

    if (cheese && inventory.cheeses.has(cheese)) {
      const cheeseDetails = inventory.cheeses.get(cheese);
      if (cheeseDetails.qty <= 0) {
        return { status: 400, message: `Cheese ${cheese} is out of stock` };
      }
      cheeseDetails.qty -= 1;
      inventory.cheeses.set(cheese, cheeseDetails);
    }

    if (veggies && Array.isArray(veggies)) {
      for (const veggie of veggies) {
        if (inventory.veggies.has(veggie)) {
          const veggieDetails = inventory.veggies.get(veggie);
          if (veggieDetails.qty <= 0) {
            return { status: 400, message: `Veggie ${veggie} is out of stock` };
          }
          veggieDetails.qty -= 1;
          inventory.veggies.set(veggie, veggieDetails);
        }
      }
    }

    await inventory.save();
    return { status: 200, message: 'Stock updated successfully', inventory };
  } catch (error) {
    return { status: 500, message: 'Error reducing stock', error: error.message };
  }
};

// Reduce stock endpoint for direct HTTP requests
export const reduceStockEndpoint = async (req, res) => {
  const { base, sauce, cheese, veggies } = req.body;
  const result = await reduceStock({ base, sauce, cheese, veggies });
  return res.status(result.status).json({ message: result.message, ...(result.inventory && { inventory: result.inventory }) });
};