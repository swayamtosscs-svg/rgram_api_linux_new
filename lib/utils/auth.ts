// Re-export auth functions from middleware for easier imports
export { verifyToken, generateToken, decodeToken, isTokenExpired, getTokenExpiration } from '../middleware/auth';
export type { JWTPayload } from '../middleware/auth';
