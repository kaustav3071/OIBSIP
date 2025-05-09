import userModel from '../models/user.model.js';

export const verifyEmail = async (req, res) => {
  try {
    const user = await userModel.findOne({ emailVerificationToken: req.params.token });

    if (!user) {
      return res.status(400).send('Invalid or expired token');
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.send('Email verified successfully. You can now log in.');
  } catch (error) {
    console.error('Email verification failed:', error);
    res.status(500).send('Server error');
  }
};


