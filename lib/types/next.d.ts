import { NextApiRequest } from 'next';
import { IUser } from '../models/User';

// Extend NextApiRequest with custom properties
export interface NextApiRequestWithUser extends NextApiRequest {
  adminUser?: IUser;
  user?: IUser;
}

// Extend NextApiRequest with file upload properties
export interface NextApiRequestWithFiles extends NextApiRequest {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// Also declare module augmentation for global types
declare module 'next' {
  interface NextApiRequest {
    adminUser?: IUser;
    user?: IUser;
    file?: Express.Multer.File;
    files?: Express.Multer.File[];
  }
}
