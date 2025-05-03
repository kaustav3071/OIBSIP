import crypto from 'crypto';
import nodemailer from 'nodemailer';
import userModel from '../models/user.model.js';

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

    await user.save();

    // Send email with the reset token
    const resetUrl = `http://localhost:4000/resetpassword/${resetToken}`;
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
      subject: 'Password Reset Request',
      html: `
        <h3>Password Reset</h3>
        <p>Hello,</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
  
    try {
      // Hash the token and find the user
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const user = await userModel.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }, // Check if token is still valid
      });
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
  
      // Update the user's password
      user.password = await userModel.hashPassword(password); // Hash the new password
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
  
      await user.save();
  
      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Error in resetPassword:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };