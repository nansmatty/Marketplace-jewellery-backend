require('dotenv').config();
import { Response } from 'express';
import { ITokenOptions } from '../@types/userTypes';
import { IUser } from '../models/Account-Master-Models/UserModel';
import { redis } from '../config/redis';

const CACHE_EXPIRY_SECONDS = 24 * 60 * 60;

export const sendToken = async (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.generateAccessToken();

  await redis.setex(user._id, CACHE_EXPIRY_SECONDS, JSON.stringify(user) as any);

  // console.log('JWT LOG', redis.get(user._id));

  const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRY || '24', 10);

  const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 1000),
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
  };

  if (process.env.NODE_ENV === 'production') {
    accessTokenOptions.secure = true;
  }

  res
    .status(statusCode)
    .cookie('access_token', accessToken, accessTokenOptions)
    .json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        is_verified: user.isVerified,
      },
    });
};
