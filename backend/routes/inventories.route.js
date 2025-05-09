import express from 'express';
import { getInventory, updateInventory, checkLowStock, reduceStockEndpoint, sendLowStockEmail } from '../controllers/inventories.controller.js';

const router = express.Router();

// Get the entire inventory
router.get('/', getInventory);

// Update the inventory (e.g., for admins to restock or adjust prices)
router.put('/', updateInventory);

// Check for low stock items
router.get('/low-stock', checkLowStock);

// Reduce stock after an order
router.post('/reduce-stock', reduceStockEndpoint);

// Send low stock email to admin
router.post('/send-low-stock-email', sendLowStockEmail);

export default router;