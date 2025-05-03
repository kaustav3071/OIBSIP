import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import BlacklistToken from '../models/blacklistToken.model.js';

export const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1]; // Extract token from cookies or Authorization header
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        // Check if the token is blacklisted
        const isBlacklisted = await BlacklistToken.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Token is blacklisted' });
        }
    
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Check if the user exists in the database
        const user = await userModel.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user; // Attach user info to request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Error in authMiddleware:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};
