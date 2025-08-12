import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../lib/database';
import User, { IUser } from '../../../lib/models/User';
import { adminMiddleware } from '../../../lib/middleware/adminAuth';

type Data =
  | { message: string }
  | { message: string; admin: Record<string, any> };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Connect to DB
    await dbConnect();

    // Check if requester is admin
    await new Promise<void>((resolve, reject) => {
      adminMiddleware(req, res, async () => {
        try {
          await resolve();
        } catch (err) {
          reject(err);
        }
      }).catch(reject);
    });

    const { email, password, username, fullName } = req.body;

    // Validate input
    if (!email || !password || !username || !fullName) {
      return res.status(400).json({
        message: 'Email, password, username and fullName are required.',
      });
    }

    // Check for existing user with email or username
    const query = {
      $or: [
        { email: email.toString() },
        { username: username.toString() }
      ]
    };
    
    const existingUser = await (User as any).findOne(query);

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists.',
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const newAdmin = new User({
      email,
      username,
      fullName,
      password: hashedPassword,
      isAdmin: true,
      isEmailVerified: true,
      isActive: true,
    });

    await newAdmin.save();

    const adminData = newAdmin.toObject();
    delete adminData.password;

    return res.status(201).json({
      message: 'Admin user created successfully.',
      admin: adminData,
    });
  } catch (error: any) {
    console.error('Error creating admin:', error);
    if (error.message && error.message.includes('Unauthorized')) {
      return res.status(401).json({ message: 'Unauthorized - Admin access required' });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
