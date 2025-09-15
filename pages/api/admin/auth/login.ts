import type { NextApiRequest, NextApiResponse } from 'next';
import User from '../../../../lib/models/User';
import dbConnect from '../../../../lib/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validateEmail, validateUsername } from '../../../../lib/utils/validation';

// Helper function to determine if input is email or username
const isEmail = (input: string): boolean => {
  return validateEmail(input);
};

// Helper function to determine if input is username
const isUsername = (input: string): boolean => {
  const usernameValidation = validateUsername(input);
  return usernameValidation.isValid;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { email, username, password } = req.body;

    // Accept either email or username, but not both
    const loginField = email || username;
    if (!loginField || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either email or username along with password'
      });
    }

    if (email && username) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either email or username, not both'
      });
    }

    // Determine if the input is email or username and find user
    let user;
    if (isEmail(loginField)) {
      // Login with email
      user = await User.findOne({ email: loginField.toLowerCase() });
    } else if (isUsername(loginField)) {
      // Login with username
      user = await User.findOne({ username: loginField.toLowerCase() });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address or username'
      });
    }

    if (!user || !user.isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or not an admin user'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, isAdmin: true },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in admin login'
    });
  }
}
