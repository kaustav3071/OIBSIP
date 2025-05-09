import OrderModel from '../models/order.model.js';
import mongoose from 'mongoose';
import UserModel from '../models/user.model.js';
import PizzaModel from '../models/pizza.model.js';
import { reduceStock } from '../controllers/inventories.controller.js';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { base, sauce, cheese, veggies, pizzaId, quantity = 1 } = req.body;
    const userId = req.user._id; // From auth middleware

    // Validate user
    const user = await UserModel.findById(userId);
    console.log(userId, user);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Validate required fields
    if (!base || !sauce || !cheese || !Array.isArray(veggies)) {
      return res.status(400).json({ message: 'Base, sauce, cheese, and veggies are required.' });
    }

    // If pizzaId is provided, fetch predefined pizza details
    let predefinedPizza = null;
    let predefinedPizzaPrice = 0;
    if (pizzaId) {
      predefinedPizza = await PizzaModel.findById(pizzaId);
      if (!predefinedPizza) {
        return res.status(404).json({ message: 'Predefined pizza not found.' });
      }
      predefinedPizzaPrice = predefinedPizza.price || 0;
    }

    // Reduce stock (this will also validate stock availability)
    const stockResponse = await reduceStock({ base, sauce, cheese, veggies, quantity });
    if (stockResponse.status !== 200) {
      return res.status(stockResponse.status).json({ message: stockResponse.message });
    }

    // Fetch inventory to calculate prices
    const inventory = await mongoose.model('Inventory').findOne();
    if (!inventory) {
      return res.status(500).json({ message: 'Inventory not found.' });
    }

    // Calculate prices for inventory items
    const basePrice = (inventory.bases.get(base)?.price || 0) * quantity;
    const saucePrice = (inventory.sauces.get(sauce)?.price || 0) * quantity;
    const cheesePrice = (inventory.cheeses.get(cheese)?.price || 0) * quantity;
    let veggiesPrice = 0;
    for (const veggie of veggies) {
      const veggiePrice = (inventory.veggies.get(veggie)?.price || 0) * quantity;
      veggiesPrice += veggiePrice;
    }

    // Adjust price for predefined pizza
    let totalAmountINR = 0;
    if (predefinedPizza) {
      totalAmountINR = predefinedPizzaPrice * quantity;
      const defaultBasePrice = (inventory.bases.get('Regular')?.price || 0) * quantity;
      const defaultSaucePrice = (inventory.sauces.get('Tomato')?.price || 0) * quantity;
      const defaultCheesePrice = (inventory.cheeses.get('Mozzarella')?.price || 0) * quantity;
      const defaultInventoryCost = defaultBasePrice + defaultSaucePrice + defaultCheesePrice;
      totalAmountINR -= defaultInventoryCost;
      totalAmountINR += basePrice + saucePrice + cheesePrice + veggiesPrice;
    } else {
      totalAmountINR = basePrice + saucePrice + cheesePrice + veggiesPrice;
    }

    // Ensure total amount is at least 1 INR
    if (totalAmountINR <= 0) {
      return res.status(400).json({ message: 'Total amount must be greater than 0.' });
    }

    // Convert INR to paise for consistency (even though we're not using Razorpay)
    const totalAmount = totalAmountINR * 100;

    // Create the order in the database
    const order = new OrderModel({
      userId,
      base,
      basePrice,
      sauce,
      saucePrice,
      cheese,
      cheesePrice,
      veggies,
      veggiesPrice,
      totalAmount,
      quantity,
      status: 'Order Received',
      pizzaId: pizzaId || null,
    });

    await order.save();

    return res.status(201).json({
      message: 'Order created successfully.',
      order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ message: 'Error creating order.', error: error.message });
  }
};

// Get all orders for a user (or all orders for admin)
export const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let orders;
    if (userRole === 'admin') {
      orders = await OrderModel.find()
        .populate('userId', 'name email')
        .populate('pizzaId', 'name description price');
    } else {
      orders = await OrderModel.find({ userId })
        .populate('userId', 'name email')
        .populate('pizzaId', 'name description price');
    }

    return res.status(200).json({ message: 'Orders fetched successfully.', orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching orders.', error: error.message });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log('Order ID received:', id); // Debugging
        console.log('New status:', status); // Debugging

        const order = await OrderModel.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Invalid order ID' });
        }

        order.status = status;
        await order.save();

        res.status(200).json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error('Error updating order status:', error.message);
        res.status(500).json({ message: 'Failed to update order status' });
    }
};

// Cancel an order (only if status is 'Order Received')
export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('Order ID received for cancellation:', id); // Debugging

        const order = await OrderModel.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Invalid order ID' });
        }

        if (order.status !== 'Order Received') {
            return res.status(400).json({ message: 'Only orders with status "Order Received" can be canceled' });
        }

        await order.deleteOne();

        res.status(200).json({ message: 'Order canceled successfully' });
    } catch (error) {
        console.error('Error canceling order:', error.message);
        res.status(500).json({ message: 'Failed to cancel order' });
    }
};