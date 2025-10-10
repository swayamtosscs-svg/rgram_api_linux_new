import mongoose from 'mongoose';

/**
 * Utility functions for ObjectId handling
 */

export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export function createObjectId(id: string): mongoose.Types.ObjectId {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ObjectId: ${id}`);
  }
  return new mongoose.Types.ObjectId(id);
}

export function safeObjectId(id: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }
  return createObjectId(id);
}

export function validateAndCreateObjectIds(ids: { [key: string]: string }): { [key: string]: mongoose.Types.ObjectId } {
  const result: { [key: string]: mongoose.Types.ObjectId } = {};
  
  for (const [key, value] of Object.entries(ids)) {
    if (!value) {
      throw new Error(`Missing required field: ${key}`);
    }
    if (!isValidObjectId(value)) {
      throw new Error(`Invalid ObjectId for ${key}: ${value}`);
    }
    result[key] = createObjectId(value);
  }
  
  return result;
}
