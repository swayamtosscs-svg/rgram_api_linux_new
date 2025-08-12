import { NextApiRequest } from 'next';
import { IUser } from '../models/User';

declare module 'next' {
  interface NextApiRequest {
    adminUser?: IUser;
  }
}
