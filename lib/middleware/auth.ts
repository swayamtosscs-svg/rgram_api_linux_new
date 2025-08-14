import jwt from 'jsonwebtoken';
import BlacklistedToken from '../models/BlacklistedToken';
import connectDB from '../database';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface JWTPayload {
  userId: string;
  iat: number;
  exp: number;
}

/**
 * Generate JWT token
 */
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  } as jwt.SignOptions);
};

/**
 * Verify JWT token and check if it's blacklisted
 */
export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    // First verify the token signature and expiration
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Connect to the database
    await connectDB();
    
    // Check if the token is blacklisted
    const blacklistedToken = await BlacklistedToken.findOne({ token });
    if (blacklistedToken) {
      console.log('Token is blacklisted');
      return null;
    }
    
    // Check if there are any special blacklist entries for this user
    // These would be entries created when an admin logs out a user
    const userId = decoded.userId;
    const specialLogoutEntries = await BlacklistedToken.find({
      userId,
      token: { $regex: `^LOGOUT_ALL_${userId}_` }
    });
    
    if (specialLogoutEntries && specialLogoutEntries.length > 0) {
      // Check if any of the special entries were created after this token was issued
      const tokenIssuedAt = new Date(decoded.iat * 1000);
      
      for (const entry of specialLogoutEntries) {
        if (entry.createdAt > tokenIssuedAt) {
          console.log('User was forcibly logged out after this token was issued');
          return null;
        }
      }
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

/**
 * Decode JWT token without verification (for expired tokens)
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = decodeToken(token);
    if (!decoded) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Blacklist a token
 */
export const blacklistToken = async (token: string, userId: string): Promise<boolean> => {
  try {
    await connectDB();
    
    // Get token expiration time
    const expiresAt = getTokenExpiration(token);
    if (!expiresAt) return false;
    
    // Add token to blacklist
    await BlacklistedToken.create({
      token,
      userId,
      expiresAt,
    });
    
    return true;
  } catch (error) {
    console.error('Token blacklisting error:', error);
    return false;
  }
};

/**
 * Check if a token is blacklisted
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    await connectDB();
    const blacklistedToken = await BlacklistedToken.findOne({ token });
    return !!blacklistedToken;
  } catch (error) {
    console.error('Token blacklist check error:', error);
    return false;
  }
};
