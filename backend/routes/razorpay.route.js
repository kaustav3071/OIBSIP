import  express from 'express';
import { create_razorpayOrder, verifyPayment, Getkey } from '../controllers/razorpay.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { body } from 'express-validator';



const razorpayRouter = express.Router();

// Route to create a Razorpay order
razorpayRouter.post('/create-payment', authMiddleware, create_razorpayOrder);
razorpayRouter.post('/verify-payment', authMiddleware, verifyPayment);
razorpayRouter.get('/getkey', authMiddleware, Getkey);


// Export the router
export default razorpayRouter;
// import express from 'express';
