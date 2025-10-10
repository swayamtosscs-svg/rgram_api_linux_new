import mongoose from 'mongoose';

/**
 * Extract user mentions from text content
 * Looks for @username patterns and returns array of user IDs
 */
export function extractMentions(content: string): mongoose.Types.ObjectId[] {
  if (!content) return [];
  
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  // For now, return empty array since we need to look up actual user IDs
  // In a real implementation, you would query the database to find users by username
  // and return their ObjectIds
  return [];
}

/**
 * Extract hashtags from text content
 * Looks for #hashtag patterns and returns array of hashtags
 */
export function extractHashtags(content: string): string[] {
  if (!content) return [];
  
  const hashtagRegex = /#(\w+)/g;
  const hashtags: string[] = [];
  let match;
  
  while ((match = hashtagRegex.exec(content)) !== null) {
    hashtags.push(match[1].toLowerCase());
  }
  
  return hashtags;
}

/**
 * Validate content for inappropriate content
 * Basic implementation - can be enhanced with AI content moderation
 */
export function validateContent(content: string): { isValid: boolean; reason?: string } {
  if (!content) return { isValid: true };
  
  // Basic profanity filter (can be enhanced)
  const inappropriateWords = ['spam', 'scam', 'fake']; // Add more as needed
  
  const lowerContent = content.toLowerCase();
  for (const word of inappropriateWords) {
    if (lowerContent.includes(word)) {
      return { isValid: false, reason: `Content contains inappropriate word: ${word}` };
    }
  }
  
  return { isValid: true };
}

/**
 * Format content for display
 * Converts mentions and hashtags to clickable links
 */
export function formatContentForDisplay(content: string): string {
  if (!content) return '';
  
  // Convert mentions to clickable links
  let formatted = content.replace(/@(\w+)/g, '<a href="/user/$1" class="mention">@$1</a>');
  
  // Convert hashtags to clickable links
  formatted = formatted.replace(/#(\w+)/g, '<a href="/hashtag/$1" class="hashtag">#$1</a>');
  
  return formatted;
}

/**
 * Generate content preview
 * Truncates content to specified length
 */
export function generateContentPreview(content: string, maxLength: number = 150): string {
  if (!content) return '';
  
  if (content.length <= maxLength) return content;
  
  return content.substring(0, maxLength) + '...';
}

/**
 * Count words in content
 */
export function countWords(content: string): number {
  if (!content) return 0;
  
  return content.trim().split(/\s+/).length;
}

/**
 * Count characters in content
 */
export function countCharacters(content: string): number {
  if (!content) return 0;
  
  return content.length;
}

/**
 * Check if content contains media references
 */
export function hasMediaReferences(content: string): boolean {
  if (!content) return false;
  
  // Check for common media file extensions
  const mediaExtensions = /\.(jpg|jpeg|png|gif|mp4|avi|mov|wmv|flv|webm|mp3|wav|ogg)$/i;
  
  return mediaExtensions.test(content);
}

/**
 * Extract URLs from content
 */
export function extractUrls(content: string): string[] {
  if (!content) return [];
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls: string[] = [];
  let match;
  
  while ((match = urlRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }
  
  return urls;
}

/**
 * Sanitize content for storage
 * Removes potentially harmful content
 */
export function sanitizeContent(content: string): string {
  if (!content) return '';
  
  // Remove HTML tags
  let sanitized = content.replace(/<[^>]*>/g, '');
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove potentially harmful characters
  sanitized = sanitized.replace(/[<>]/g, '');
  
  return sanitized.trim();
}
