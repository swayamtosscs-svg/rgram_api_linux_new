import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDB from '../database';
import { Admin } from '../models/Admin';

export interface AdminTokenPayload {
  userId: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: {
    canManageUsers: boolean;
    canDeleteContent: boolean;
    canBlockUsers: boolean;
    canViewAnalytics: boolean;
    canModerateContent: boolean;
    canManageReports: boolean;
  };
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as AdminTokenPayload;
    
    // Verify admin is still active
    await connectDB();
    const admin = await Admin.findOne({ 
      user: decoded.userId, 
      isActive: true 
    });

    if (!admin) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

export function requireAdmin(requiredRole?: 'super_admin' | 'admin' | 'moderator') {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Admin authentication required' 
      });
    }

    const decoded = await verifyAdminToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired admin token' 
      });
    }

    if (requiredRole && decoded.role !== requiredRole) {
      return res.status(403).json({ 
        success: false, 
        message: `${requiredRole} role required` 
      });
    }

    // Add admin info to request
    (req as any).admin = decoded;
    next();
  };
}

export function requirePermission(permission: keyof AdminTokenPayload['permissions']) {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const admin = (req as any).admin as AdminTokenPayload;
    
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Admin authentication required' 
      });
    }

    if (!admin.permissions[permission]) {
      return res.status(403).json({ 
        success: false, 
        message: `Permission required: ${permission}` 
      });
    }

    next();
  };
}

// Export adminMiddleware as an alias for requireAdmin for backward compatibility
export const adminMiddleware = requireAdmin;