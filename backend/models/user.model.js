import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
      match : [/.+\@.+\..+/, "Please enter a valid email"],
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
        type: Object,
        default: {},
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
  },
  {
    minimize: false, // Allow empty objects in cartData
    timestamps: true, // Automatically handles createdAt and updatedAt
  }
);

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

// Compare passwords
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};


userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

// Create and export the model
const User = mongoose.models.User || mongoose.model('User', userSchema);


export default User;