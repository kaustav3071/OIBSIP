import userModel from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import blacklistTokenModel from '../models/blacklistToken.model.js';

dotenv.config();

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

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


export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email }).select('+password'); // Ensure password is included in the query resul
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
    res.cookie('token', token)

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const logoutUser = async (req, res) => {
  try{
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);; // Get the token from cookies
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    // Add the token to the blacklist
    const blacklistedToken = new blacklistTokenModel({ token });
    await blacklistedToken.save();

    res.clearCookie('token'); // Clear the cookie
    res.status(200).json({ message: 'Logout successful' });
  }
  catch (error) {
    console.error('Error in logoutUser:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const userProfile = async (req, res) => {
  try {
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);; // Get the token from cookies
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select('-password'); // Exclude password from the response

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error in userProfile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}