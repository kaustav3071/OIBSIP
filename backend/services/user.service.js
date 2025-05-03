import userModel from '../models/user.model.js';

// create a new user
export const createUser = async (userData) => {
   if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
   }
    const user = new userModel.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'user',
        cartData: userData.cartData || {},
    })
    return user;
};
