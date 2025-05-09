import Order from "../models/order.model.js";
import express from "express";
import { body } from "express-validator";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import { createOrder,getOrders,updateOrderStatus,cancelOrder } from "../controllers/order.controller.js";

import { getInventory } from "../controllers/inventories.controller.js"; // Import getInventory from inventories controller
import { GetUserById } from "../controllers/user.controller.js"; // Import getUserById from user controller


dotenv.config();

const router = express.Router();

router.post("/create_order", authMiddleware, createOrder); // Create order route
router.get("/get_orders", authMiddleware, getOrders); // Get all orders route
router.put("/update_order/:id", authMiddleware, updateOrderStatus); // Update order status route
router.delete("/cancel_order/:id", authMiddleware, cancelOrder); // Cancel order route


export default router;