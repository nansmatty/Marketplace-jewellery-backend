import { Request } from 'express';
import { IUser } from '../models/Account-Master-Models/UserModel';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
