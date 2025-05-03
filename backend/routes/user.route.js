import express from 'express';
import { registerUser, loginUser, logoutUser, userProfile, GetAllUsers, GetUserById, UpdateUser, DeleteUser} from '../controllers/user.controller.js';
import { verifyEmail } from '../controllers/email.controller.js';
import { body } from 'express-validator';
import { authMiddleware  } from '../middlewares/auth.middleware.js';
import userModel from '../models/user.model.js';
import { forgotPassword, resetPassword } from '../controllers/forgotpassword.controller.js';


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

userRouter.get('/logout', authMiddleware ,logoutUser);

userRouter.get('/profile', authMiddleware ,userProfile) //error: userProfile is not a function

userRouter.get('/allUsers',GetAllUsers)

userRouter.get('/user/:id',GetUserById)

userRouter.put('/updateUser/:id',UpdateUser)

userRouter.delete('/delete/:id',DeleteUser);


userRouter.post('/forgotpassword', forgotPassword);
userRouter.put('/resetpassword/:token', resetPassword);
// Export the router
export default userRouter;