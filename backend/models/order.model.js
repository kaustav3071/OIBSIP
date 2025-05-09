import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    base: {
      type: String,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    sauce: {
      type: String,
      required: true,
    },
    saucePrice: {
      type: Number,
      required: true,
    },
    cheese: {
      type: String,
      required: true,
    },
    cheesePrice: {
      type: Number,
      required: true,
    },
    veggies: {
      type: [String],
      default: [],
    },
    veggiesPrice: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["Order Received", "In the Kitchen", "Sent to Delivery", "Delivered"],
      default: "Order Received",
    },
    razorpayOrderId: {
      type: String,
      required: true,
      default: "abcd1234", // Placeholder value, should be replaced with actual Razorpay order ID
    },
    pizzaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pizza",
      default: null,
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;