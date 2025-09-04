import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import User from '../../../lib/models/User';

// MongoDB connection function
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4,
      retryWrites: true,
      w: 1
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    console.log('📋 Starting assets list...');

    // Connect to MongoDB
    await connectToDatabase();

    // Get user ID from query parameters
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required. Provide userId in query params' 
      });
    }

    // Get user details from database to get username
    const user = await User.findById(userId).select('username fullName').lean();
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const username = user.username || user.fullName || userId;
    console.log('👤 User found:', { userId, username });

    // Get query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const folder = req.query.folder as string || 'all';
    const type = req.query.type as string || 'all';
    const search = req.query.search as string || '';

    // Create user directory path using username
    const userDir = path.join(process.cwd(), 'public', 'assets', username);
    
    if (!fs.existsSync(userDir)) {
      return res.json({
        success: true,
        message: 'Assets retrieved successfully',
        data: {
          files: [],
          pagination: {
            page: 1,
            limit: limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          },
          filters: {
            folder: folder,
            type: type,
            search: search,
            sortBy: 'uploadedAt',
            sortOrder: 'desc'
          },
          statistics: {
            folderStats: {
              images: 0,
              videos: 0,
              audio: 0,
              documents: 0,
              general: 0,
              total: 0
            },
            totalSize: 0,
            totalSizeMB: 0
          },
          storageInfo: {
            type: 'assets',
            basePath: '/assets',
            userPath: `/assets/${username}`,
            username: username,
            userId: userId
          }
        }
      });
    }

    // Get all files from user directory
    const allFiles = [];
    const folderStats = {
      images: 0,
      videos: 0,
      audio: 0,
      documents: 0,
      general: 0,
      total: 0
    };

    const folders = ['images', 'videos', 'audio', 'documents', 'general'];
    
    for (const folderName of folders) {
      const folderPath = path.join(userDir, folderName);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        
        for (const file of files) {
          const filePath = path.join(folderPath, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isFile()) {
            const fileInfo = {
              fileName: file,
              originalName: file,
              folder: folderName,
              fileType: folderName === 'images' ? 'image' : 
                       folderName === 'videos' ? 'video' : 
                       folderName === 'audio' ? 'audio' : 
                       folderName === 'documents' ? 'document' : 'general',
              size: stats.size,
              publicUrl: `/assets/${username}/${folderName}/${file}`,
              localPath: filePath,
              uploadedAt: stats.birthtime,
              modifiedAt: stats.mtime,
              uploadedBy: {
                userId: userId,
                username: username,
                fullName: user.fullName
              }
            };
            
            allFiles.push(fileInfo);
            folderStats[folderName as keyof typeof folderStats]++;
            folderStats.total++;
          }
        }
      }
    }

    // Apply filters
    let filteredFiles = allFiles;

    if (folder !== 'all') {
      filteredFiles = filteredFiles.filter(file => file.folder === folder);
    }

    if (type !== 'all') {
      filteredFiles = filteredFiles.filter(file => file.fileType === type);
    }

    if (search) {
      filteredFiles = filteredFiles.filter(file => 
        file.fileName.toLowerCase().includes(search.toLowerCase()) ||
        file.originalName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort files by upload date (newest first)
    filteredFiles.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    // Calculate pagination
    const total = filteredFiles.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

    // Calculate total size
    const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);
    const totalSizeMB = totalSize / (1024 * 1024);

    // Return results
    res.json({
      success: true,
      message: 'Assets retrieved successfully',
      data: {
        files: paginatedFiles,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          totalPages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          folder: folder,
          type: type,
          search: search,
          sortBy: 'uploadedAt',
          sortOrder: 'desc'
        },
        statistics: {
          folderStats: folderStats,
          totalSize: totalSize,
          totalSizeMB: Math.round(totalSizeMB * 100) / 100
        },
        storageInfo: {
          type: 'assets',
          basePath: '/assets',
          userPath: `/assets/${username}`,
          username: username,
          userId: userId
        }
      }
    });

  } catch (error: any) {
    console.error('Assets list error:', error);
    res.status(500).json({
      success: false,
      message: 'Assets list failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
