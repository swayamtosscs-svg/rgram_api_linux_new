import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine folder type based on file type
    let folderType = 'images';
    if (file.mimetype.startsWith('video/')) {
      folderType = 'videos';
    } else if (file.mimetype.startsWith('audio/')) {
      folderType = 'audio';
    }
    
    const uploadPath = path.join(process.cwd(), 'public', 'assets', folderType);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    
    // Sanitize filename
    const sanitizedName = baseName
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .substring(0, 50);
    
    cb(null, `${sanitizedName}_${uniqueSuffix}${ext}`);
  }
});

// File filter to allow specific file types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/mpeg'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`));
  }
};

// Configure multer with increased limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10, // Maximum 10 files per request
    fieldSize: 10 * 1024 * 1024, // 10MB for text fields
    fieldNameSize: 100
  }
});

// Middleware to handle file uploads
export const uploadMiddleware = (fields: multer.Field[] = []) => {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    // Add userId to request for multer destination
    (req as any).userId = (req as any).user?.userId || 'temp';
    
    const uploadHandler = fields.length > 0 
      ? upload.fields(fields)
      : upload.any();
    
    uploadHandler(req as any, res as any, (err: any) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }
      next();
    });
  };
};

// Helper function to get file info
export const getFileInfo = (file: Express.Multer.File) => {
  const stats = fs.statSync(file.path);
  
  // Determine folder type based on file type
  let folderType = 'images';
  if (file.mimetype.startsWith('video/')) {
    folderType = 'videos';
  } else if (file.mimetype.startsWith('audio/')) {
    folderType = 'audio';
  }
  
  return {
    fileName: file.filename,
    originalName: file.originalname,
    filePath: file.path,
    publicUrl: `/assets/${folderType}/${file.filename}`,
    fileSize: stats.size,
    mimeType: file.mimetype,
    storageType: 'local',
    isPublic: true,
    type: file.mimetype.startsWith('image/') ? 'image' : 
          file.mimetype.startsWith('video/') ? 'video' : 'audio'
  };
};

// Helper function to delete file
export const deleteFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Song upload configuration
export const songUploadMiddleware = uploadMiddleware([
  { name: 'audioFile', maxCount: 1 },
  { name: 'thumbnailFile', maxCount: 1 }
]);

// Media upload configuration for posts/reels/stories with song support
export const mediaUploadMiddleware = (fields: multer.Field[] = [
  { name: 'mediaFiles', maxCount: 10 },
  { name: 'audioFile', maxCount: 1 },
  { name: 'thumbnailFile', maxCount: 1 }
]) => uploadMiddleware(fields);

export default uploadMiddleware;
