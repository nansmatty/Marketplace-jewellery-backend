import { NextFunction, Request, RequestHandler, Response } from 'express';
import rateLimit from 'express-rate-limit';
import ErrorHandler from '../utils/errorHandler';

export const createRateLimit = (limit: number, expTime: number): RequestHandler => {
  return rateLimit({
    windowMs: expTime * 60 * 1000, // 24 hrs in milliseconds
    max: limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, _res: Response, next: NextFunction) => {
      return next(new ErrorHandler('You exceeded the request limit. Please try after sometime', 429));
    },
  });
};
