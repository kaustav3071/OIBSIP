import userModel from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { validationResult } from 'express-validator';

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

    const hashedPassword = await userModel.hashPassword(password);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      emailVerificationToken,
      isVerified: false,
    });

    await newUser.save();

    const verificationUrl = `http://localhost:4000/verify/${emailVerificationToken}`;

    // Set up transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password recommended
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

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
    });

  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const loginUser = async (req, res) => {
  







}
