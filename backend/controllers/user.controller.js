import userModel from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import blacklistTokenModel from '../models/blacklistToken.model.js';
import mongoose from 'mongoose';

dotenv.config();

export const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    const isUserAlreadyExist = await userModel.findOne({ email });
    if (isUserAlreadyExist) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); 

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      emailVerificationToken,
      isVerified: false,
    });

    await newUser.save();

    const verificationUrl = `http://localhost:4000/user/verify/${emailVerificationToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"PizzaCraft" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `
        <h3>Email Verification</h3>
        <p>Hello ${name},</p>
        <p>Please click the following link to verify your email:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `,
    };

    await transporter.sendMail(mailOptions);

    const token = newUser.generateAuthToken();

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email before logging in' });
    }

    const token = user.generateAuthToken();
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        cartData: user.cartData || [], // Ensure cartData is an array
      },
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    const blacklistedToken = new blacklistTokenModel({ token });
    await blacklistedToken.save();

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error in logoutUser:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const userProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error('Error in userProfile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCart = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { cartData } = req.body;

        // Fetch inventory to calculate prices
        const inventory = await mongoose.model('Inventory').findOne();
        if (!inventory) {
            return res.status(500).json({ message: 'Inventory not found.' });
        }

        const updatedCart = cartData.map((item) => {
            const basePrice = inventory.bases.get(item.base)?.price || 0;
            const saucePrice = inventory.sauces.get(item.sauce)?.price || 0;
            const cheesePrice = inventory.cheeses.get(item.cheese)?.price || 0;
            const veggiesPrice = (item.veggies || []).reduce((total, veggie) => {
                return total + (inventory.veggies.get(veggie)?.price || 0);
            }, 0);

            const defaultBasePrice = inventory.bases.get('Regular')?.price || 40;
            const defaultSaucePrice = inventory.sauces.get('Tomato')?.price || 0;
            const defaultCheesePrice = inventory.cheeses.get('Mozzarella')?.price || 30;
            const defaultInventoryCost = defaultBasePrice + defaultSaucePrice + defaultCheesePrice;
            const isPredefined = !!item.pizzaId;
            const basePizzaPrice = item.originalPrice || item.price || 0;

            let adjustedPrice = basePizzaPrice;

            if (!isPredefined) {
                adjustedPrice = basePizzaPrice - defaultInventoryCost + basePrice + saucePrice + cheesePrice + veggiesPrice;
            }

            return {
                ...item,
                price: adjustedPrice,
                originalPrice: item.originalPrice || item.price || 0,
            };
        });

        // Update the user's cart
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.cartData = updatedCart;
        await user.save();

        res.status(200).json({ message: 'Cart updated successfully.', cartData: updatedCart });
    } catch (error) {
        console.error('Error updating cart:', error.message);
        res.status(500).json({ message: 'Failed to update cart.', error: error.message });
    }
};

export const GetAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.find({}).select('-password -emailVerificationToken -__v').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error in GetAllUsers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const GetUserById = async (req, res, next) => { 
  const { id } = req.params;
  try {
    const user = await userModel.findById(id).select('-password -emailVerificationToken -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in GetUserById:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const UpdateUser = async (req, res, next) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error in UpdateUser:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const DeleteUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in DeleteUser:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};