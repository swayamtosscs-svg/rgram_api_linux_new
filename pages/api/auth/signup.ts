import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { generateToken } from '../../../lib/middleware/auth';
import { sendWelcomeEmail } from '../../../lib/utils/email';
import { validateEmail, validatePassword } from '@/lib/utils/validation';
import { ensureUserMediaFolders } from '../../../utils/mediaLibrary';

// Valid religion options
const VALID_RELIGIONS = [
  'hinduism', 'islam', 'christianity', 'buddhism', 'sikhism', 'judaism',
  'jainism', 'zoroastrianism', 'bahai', 'shinto', 'taoism', 'confucianism',
  'other', 'none'
];

/**
 * Generate unique username
 */
const generateUniqueUsername = async (baseUsername: string): Promise<string> => {
  if (!baseUsername || typeof baseUsername !== 'string') {
    baseUsername = 'user';
  }
  let username = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
  let counter = 1;
  let finalUsername = username;

  while (await (User as any).findOne({ username: finalUsername })) {
    finalUsername = `${username}${counter}`;
    counter++;
  }

  return finalUsername;
};

/**
 * Validate religion selection
 */
const validateReligion = (religion: string): { isValid: boolean; message?: string } => {
  if (!religion) {
    return { isValid: false, message: 'Religion selection is required' };
  }
  
  if (!VALID_RELIGIONS.includes(religion.toLowerCase())) {
    return { 
      isValid: false, 
      message: `Invalid religion. Please choose from: ${VALID_RELIGIONS.join(', ')}` 
    };
  }
  
  return { isValid: true };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    await connectDB();

    const { email, password, fullName, username, religion } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required'
      });
    }

    // Validate religion
    const religionValidation = validateReligion(religion);
    if (!religionValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: religionValidation.message
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    // Check if user already exists
    const existingUser = await (User as any).findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Generate unique username if not provided
    const finalUsername = username ? await generateUniqueUsername(username) : await generateUniqueUsername(fullName);

    // Create user
    const user = await (User as any).create({
      email,
      password,
      fullName,
      username: finalUsername,
      religion: religion.toLowerCase(), // Store religion in lowercase
      isEmailVerified: false,
      isActive: true,
      createdAt: new Date(),
      lastActive: new Date()
    });

    // Create Media Library folders for the new user
    try {
      await ensureUserMediaFolders(finalUsername);
      console.log(`Media Library folders created for user: ${finalUsername}`);
    } catch (folderError) {
      console.error('Failed to create Media Library folders:', folderError);
      // Don't fail signup if folder creation fails
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send welcome email (optional)
    try {
      await sendWelcomeEmail(email, finalUsername);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          religion: user.religion,
          avatar: user.avatar,
          bio: user.bio,
          website: user.website,
          location: user.location,
          isPrivate: user.isPrivate,
          isEmailVerified: user.isEmailVerified,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          postsCount: user.postsCount,
          reelsCount: user.reelsCount,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
