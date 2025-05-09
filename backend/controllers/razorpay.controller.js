import razorpay from 'razorpay';
import crypto from 'crypto';
import userModel from '../models/user.model.js';

export const create_razorpayOrder = async (req, res) => {
    const { amount } = req.body;
    const instance = new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
    });

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }

    const options = {
        amount: amount * 100, // amount in the smallest currency unit
        currency: 'INR',
        receipt: crypto.randomBytes(10).toString('hex'),
    };

    const order = await instance.orders.create(options);
    if (!order) {
        return res.status(500).json({ message: 'Error creating order' });
    }
    else{
        return res.status(200).json({ 
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    }

}

export const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
        return res.status(400).json({ message: 'Invalid signature' });
    }

    const userId = req.user._id;
    const user = await userModel.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    await user.save();


    res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
    });

}

export const Getkey = async (req, res) => {
    const key = process.env.RAZORPAY_KEY_ID;
    if (!key) {
        return res.status(500).json({ message: 'Error getting key' });
    }
    else{
        return res.status(200).json({ 
            success: true,
            key: key,
        });
    }
}

