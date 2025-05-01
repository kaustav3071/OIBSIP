import express from 'express';
import { registerUser, loginUser, logoutUser, userProfile } from '../controllers/user.controller.js';
import { verifyEmail } from '../controllers/email.controller.js';
import { body } from 'express-validator';

const userRouter = express.Router();

// User registration route
userRouter.post(
    '/register',
    [
      body('name').notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Invalid email address'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ],
    registerUser
  );


// User login route
userRouter.post('/login', loginUser);


userRouter.get('/verify/:token', verifyEmail);

userRouter.get('/logout', logoutUser);

userRouter.get('/profile', userProfile) //error: userProfile is not a function



// Export the router
export default userRouter;