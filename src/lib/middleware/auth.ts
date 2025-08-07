// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET!;
// const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

// if (!JWT_SECRET) {
//   throw new Error('JWT_SECRET environment variable is required');
// }

// export interface JWTPayload {
//   userId: string;
//   iat: number;
//   exp: number;
// }

// /**
//  * Generate JWT token
//  */
// export const generateToken = (userId: string): string => {
//   return jwt.sign({ userId }, JWT_SECRET, {
//     expiresIn: JWT_EXPIRE,
//   });
// };

// /**
//  * Verify JWT token
//  */
// export const verifyToken = (token: string): JWTPayload | null => {
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
//     return decoded;
//   } catch (error) {
//     console.error('Token verification error:', error);
//     return null;
//   }
// };

// /**
//  * Decode JWT token without verification (for expired tokens)
//  */
// export const decodeToken = (token: string): JWTPayload | null => {
//   try {
//     const decoded = jwt.decode(token) as JWTPayload;
//     return decoded;
//   } catch (error) {
//     console.error('Token decode error:', error);
//     return null;
//   }
// };

// /**
//  * Check if token is expired
//  */
// export const isTokenExpired = (token: string): boolean => {
//   try {
//     const decoded = decodeToken(token);
//     if (!decoded) return true;
    
//     const currentTime = Math.floor(Date.now() / 1000);
//     return decoded.exp &lt; currentTime;
//   } catch (error) {
//     return true;
//   }
// };

// /**
//  * Get token expiration time
//  */
// export const getTokenExpiration = (token: string): Date | null => {
//   try {
//     const decoded = decodeToken(token);
//     if (!decoded) return null;
    
//     return new Date(decoded.exp * 1000);
//   } catch (error) {
//     return null;
//   }
// };

// utils/jwt.ts

import jwt, { Secret } from 'jsonwebtoken';

// ✅ Explicitly cast to correct type
const JWT_SECRET: Secret = process.env.JWT_SECRET as string;
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
  return jwt.sign({ userId }, JWT_SECRET);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
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
