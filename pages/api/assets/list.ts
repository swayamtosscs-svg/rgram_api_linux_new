import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Get user ID from query parameters or headers
    const userId = req.query.userId as string || req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required. Provide userId in query params or x-user-id header' 
      });
    }

    // Validate user ID format (basic validation)
    if (userId.length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }

    // Get query parameters
    const { 
      folder = 'all', 
      type = 'all', 
      page = '1', 
      limit = '20',
      search = '',
      sortBy = 'uploadedAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100); // Max 100 items per page
    const skip = (pageNum - 1) * limitNum;

    // User's assets directory
    const userDir = path.join(process.cwd(), 'public', 'assets', userId);
    
    if (!fs.existsSync(userDir)) {
      return res.json({
        success: true,
        message: 'No assets found',
        data: {
          files: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            totalPages: 0
          },
          filters: {
            folder: folder as string,
            type: type as string,
            search: search as string
          }
        }
      });
    }

    // Get all files from user directory
    const allFiles = [];
    const folders = ['images', 'videos', 'audio', 'documents', 'general'];

    for (const folderName of folders) {
      const folderPath = path.join(userDir, folderName);
      
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        
        for (const fileName of files) {
          const filePath = path.join(folderPath, fileName);
          const fileStats = fs.statSync(filePath);
          
          if (fileStats.isFile()) {
            // Determine file type from extension
            const ext = path.extname(fileName).toLowerCase();
            let fileType = 'general';
            
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.avif'].includes(ext)) {
              fileType = 'image';
            } else if (['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'].includes(ext)) {
              fileType = 'video';
            } else if (['.mp3', '.wav', '.aac', '.ogg', '.flac'].includes(ext)) {
              fileType = 'audio';
            } else if (['.pdf', '.doc', '.docx', '.txt'].includes(ext)) {
              fileType = 'document';
            }

            allFiles.push({
              fileName: fileName,
              originalName: fileName, // We don't store original names in assets storage
              folder: folderName,
              fileType: fileType,
              size: fileStats.size,
              publicUrl: `/assets/${userId}/${folderName}/${fileName}`,
              localPath: filePath,
              uploadedAt: fileStats.birthtime,
              modifiedAt: fileStats.mtime,
              uploadedBy: {
                userId: userId,
                username: userId, // Using userId as username for simplicity
                fullName: userId
              }
            });
          }
        }
      }
    }

    // Apply filters
    let filteredFiles = allFiles;

    // Filter by folder
    if (folder !== 'all') {
      filteredFiles = filteredFiles.filter(file => file.folder === folder);
    }

    // Filter by type
    if (type !== 'all') {
      filteredFiles = filteredFiles.filter(file => file.fileType === type);
    }

    // Filter by search term
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredFiles = filteredFiles.filter(file => 
        file.fileName.toLowerCase().includes(searchTerm) ||
        file.originalName.toLowerCase().includes(searchTerm)
      );
    }

    // Sort files
    filteredFiles.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        case 'fileName':
          aValue = a.fileName.toLowerCase();
          bValue = b.fileName.toLowerCase();
          break;
        case 'uploadedAt':
        default:
          aValue = new Date(a.uploadedAt).getTime();
          bValue = new Date(b.uploadedAt).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const total = filteredFiles.length;
    const totalPages = Math.ceil(total / limitNum);
    const paginatedFiles = filteredFiles.slice(skip, skip + limitNum);

    // Calculate folder statistics
    const folderStats = {
      images: allFiles.filter(f => f.folder === 'images').length,
      videos: allFiles.filter(f => f.folder === 'videos').length,
      audio: allFiles.filter(f => f.folder === 'audio').length,
      documents: allFiles.filter(f => f.folder === 'documents').length,
      general: allFiles.filter(f => f.folder === 'general').length,
      total: allFiles.length
    };

    // Calculate total size
    const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);

    res.json({
      success: true,
      message: 'Assets retrieved successfully',
      data: {
        files: paginatedFiles,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total,
          totalPages: totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        },
        filters: {
          folder: folder as string,
          type: type as string,
          search: search as string,
          sortBy: sortBy as string,
          sortOrder: sortOrder as string
        },
        statistics: {
          folderStats,
          totalSize: totalSize,
          totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100
        },
        storageInfo: {
          type: 'assets',
          basePath: '/assets',
          userPath: `/assets/${userId}`
        }
      }
    });

  } catch (error: any) {
    console.error('Assets list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
