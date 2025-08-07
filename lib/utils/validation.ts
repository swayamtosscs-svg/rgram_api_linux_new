import validator from 'validator';

/**
 * Validate email address
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return validator.isEmail(email.trim());
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      message: 'Password is required'
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long'
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      message: 'Password must be less than 128 characters'
    };
  }

  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      message: 'Password must contain at least one letter and one number'
    };
  }

  return {
    isValid: true,
    message: 'Password is valid'
  };
};

/**
 * Validate username
 */
export const validateUsername = (username: string): { isValid: boolean; message: string } => {
  if (!username || typeof username !== 'string') {
    return {
      isValid: false,
      message: 'Username is required'
    };
  }

  const trimmedUsername = username.trim().toLowerCase();

  if (trimmedUsername.length < 3) {
    return {
      isValid: false,
      message: 'Username must be at least 3 characters long'
    };
  }

  if (trimmedUsername.length > 30) {
    return {
      isValid: false,
      message: 'Username must be less than 30 characters'
    };
  }

  // Check for valid characters (letters, numbers, underscores only)
  if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
    return {
      isValid: false,
      message: 'Username can only contain letters, numbers, and underscores'
    };
  }

  // Check for reserved usernames
  const reservedUsernames = [
    'admin', 'administrator', 'root', 'api', 'www', 'mail', 'ftp',
    'support', 'help', 'info', 'contact', 'about', 'terms', 'privacy',
    'rgram', 'r-gram', 'system', 'user', 'users', 'profile', 'profiles',
    'post', 'posts', 'reel', 'reels', 'auth', 'login', 'signup', 'register'
  ];

  if (reservedUsernames.includes(trimmedUsername)) {
    return {
      isValid: false,
      message: 'This username is reserved and cannot be used'
    };
  }

  return {
    isValid: true,
    message: 'Username is valid'
  };
};

/**
 * Validate full name
 */
export const validateFullName = (fullName: string): { isValid: boolean; message: string } => {
  if (!fullName || typeof fullName !== 'string') {
    return {
      isValid: false,
      message: 'Full name is required'
    };
  }

  const trimmedName = fullName.trim();

  if (trimmedName.length < 2) {
    return {
      isValid: false,
      message: 'Full name must be at least 2 characters long'
    };
  }

  if (trimmedName.length > 50) {
    return {
      isValid: false,
      message: 'Full name must be less than 50 characters'
    };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
    return {
      isValid: false,
      message: 'Full name can only contain letters, spaces, hyphens, and apostrophes'
    };
  }

  return {
    isValid: true,
    message: 'Full name is valid'
  };
};

/**
 * Validate URL
 */
export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  return validator.isURL(url.trim(), {
    protocols: ['http', 'https'],
    require_protocol: true
  });
};

/**
 * Validate bio
 */
export const validateBio = (bio: string): { isValid: boolean; message: string } => {
  if (!bio) {
    return {
      isValid: true,
      message: 'Bio is valid'
    };
  }

  if (typeof bio !== 'string') {
    return {
      isValid: false,
      message: 'Bio must be a string'
    };
  }

  if (bio.length > 500) {
    return {
      isValid: false,
      message: 'Bio must be less than 500 characters'
    };
  }

  return {
    isValid: true,
    message: 'Bio is valid'
  };
};

/**
 * Validate location
 */
export const validateLocation = (location: string): { isValid: boolean; message: string } => {
  if (!location) {
    return {
      isValid: true,
      message: 'Location is valid'
    };
  }

  if (typeof location !== 'string') {
    return {
      isValid: false,
      message: 'Location must be a string'
    };
  }

  if (location.length > 100) {
    return {
      isValid: false,
      message: 'Location must be less than 100 characters'
    };
  }

  return {
    isValid: true,
    message: 'Location is valid'
  };
};

/**
 * Sanitize input string
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return validator.escape(input.trim());
};

/**
 * Validate post content
 */
export const validatePostContent = (content: string): { isValid: boolean; message: string } => {
  if (!content || typeof content !== 'string') {
    return {
      isValid: false,
      message: 'Content is required'
    };
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length === 0) {
    return {
      isValid: false,
      message: 'Content cannot be empty'
    };
  }

  if (trimmedContent.length > 2000) {
    return {
      isValid: false,
      message: 'Content must be less than 2000 characters'
    };
  }

  return {
    isValid: true,
    message: 'Content is valid'
  };
};

/**
 * Validate comment content
 */
export const validateCommentContent = (content: string): { isValid: boolean; message: string } => {
  if (!content || typeof content !== 'string') {
    return {
      isValid: false,
      message: 'Comment content is required'
    };
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length === 0) {
    return {
      isValid: false,
      message: 'Comment cannot be empty'
    };
  }

  if (trimmedContent.length > 500) {
    return {
      isValid: false,
      message: 'Comment must be less than 500 characters'
    };
  }

  return {
    isValid: true,
    message: 'Comment is valid'
  };
};
