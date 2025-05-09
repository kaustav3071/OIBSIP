import Razorpay from 'razorpay';
import crypto from 'crypto';
import userModel from '../models/user.model.js';

// Utility to add a timeout to a promise
const timeoutPromise = (promise, time) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), time);
    }),
  ]);
};

export const create_razorpayOrder = async (req, res) => {
  const { amount } = req.body;

  // Validate environment variables
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('Razorpay API keys are not configured');
    return res.status(500).json({ message: 'Payment gateway configuration error' });
  }

  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  const options = {
    amount: amount * 100, // amount in paise
    currency: 'INR',
    receipt: crypto.randomBytes(10).toString('hex'),
  };

  try {
    console.log('Creating Razorpay order with options:', options);
    const order = await timeoutPromise(instance.orders.create(options), 10000);
    if (!order) {
      return res.status(500).json({ message: 'Error creating order' });
    }
    return res.status(200).json({ 
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error.message);
    if (error.message === 'Operation timed out') {
      return res.status(503).json({ message: 'Payment gateway request timed out. Please try again later.' });
    }
    if (error.code === 'ECONNRESET') {
      return res.status(503).json({ message: 'Unable to connect to payment gateway. Please try again later.' });
    }
    return res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isSignatureValid = expectedSignature === razorpay_signature;

  if (!isSignatureValid) {
    return res.status(400).json({ message: 'Invalid signature' });
  }

  try {
    const userId = req.user._id;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cartData = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Error verifying payment:', error.message);
    return res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};

export const Getkey = async (req, res) => {
  const key = process.env.RAZORPAY_KEY_ID;
  if (!key) {
    return res.status(500).json({ message: 'Error getting key' });
  }
  return res.status(200).json({ 
    success: true,
    key: key,
  });
};