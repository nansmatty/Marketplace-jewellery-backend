import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../utils/catchAsyncError';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/Account-Master-Models/UserModel';
import ErrorHandler from '../utils/errorHandler';
import { redis } from '../config/redis';
import Roles from '../models/Account-Master-Models/RolesModel';

export const isAuthenticated = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const access_token = req.cookies.access_token || req.header('Authorization')?.replace('Bearer ', '');

    if (!access_token) {
      return next(new ErrorHandler('access_token not found', 401));
    }

    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;

    if (!decoded) {
      return next(new ErrorHandler('Not Authorized', 400));
    }

    // IF redis installed
    const user = await redis.get(decoded._id);

    if (!user) {
      return next(new ErrorHandler('User not found.', 400));
    }

    req.user = JSON.parse(user);

    // const user = await User.findById(decoded._id).select('-password');
    // req.user = user;

    next();
  } catch (error) {
    return next(new ErrorHandler('You are not authorized. Please login first!', 500));
  }
});

export const isVerifiedSeller = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id);

    const role = await Roles.findById(user?.role_id);

    if (role?.code === 'SELLER' && user?.isVerifiedSeller) {
      next();
    } else {
      return next(new ErrorHandler('You are not authorized!', 401));
    }
  } catch (error) {
    return next(new ErrorHandler('Something went wrong. Please try after sometime.', 500));
  }
});

export const isAdmin = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id);

    const role = await Roles.findById(user?.role_id);

    if (role?.code === 'ADMIN') {
      next();
    } else {
      return next(new ErrorHandler('You are not authorized!', 401));
    }
  } catch (error) {
    return next(new ErrorHandler('Something went wrong. Please try after sometime.', 500));
  }
});

export const isSuperAdmin = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id);

    const role = await Roles.findById(user?.role_id);

    if (role?.code === 'SUPER ADMIN') {
      next();
    } else {
      return next(new ErrorHandler('You are not authorized!', 401));
    }
  } catch (error) {
    return next(new ErrorHandler('Something went wrong. Please try after sometime.', 500));
  }
});
