import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import BlacklistToken from './blacklistToken.model.js';

// Load environment variables
dotenv.config();

const cartItemSchema = new mongoose.Schema({
  pizzaId: {
    type: String,
    required: true,
  },
  pizzaName: {
    type: String,
    required: true,
  },
  pizzaImage: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  base: {
    type: String,
    required: true,
  },
  sauce: {
    type: String,
    required: true,
  },
  cheese: {
    type: String,
    required: true,
  },
  veggies: {
    type: [String],
    default: [],
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    cartData: {
      type: [cartItemSchema],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    address: {
    type: String,
    required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// Compare passwords
userSchema.methods.comparePassword = async function (password) {
  const result = await bcrypt.compare(password, this.password);
  console.log('Comparing:', password, 'with', this.password, '=>', result);
  return result;
};

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

// Check if token is blacklisted
userSchema.statics.isTokenBlacklisted = async function (token) {
  try {
    const blacklisted = await BlacklistToken.findOne({ token });
    return blacklisted ? true : false;
  } catch (error) {
    console.error("Error checking blacklist:", error);
    return false;
  }
};

// Create and export the model
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
