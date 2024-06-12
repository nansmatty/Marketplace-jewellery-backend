import { NextFunction, Request, Response } from 'express';
import ErrorHandler from '../utils/errorHandler';

export const ErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  //Mongodb Error
  if (err.name === 'CastError') {
    const message = `Resources not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //Duplicate Key Error
  if (err.name === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // Wrong JWT Token
  if (err.name === 'JsonWebTokenError') {
    const message = `Invalid Token`;
    err = new ErrorHandler(message, 400);
  }

  // Expired JWT Token
  if (err.name === 'TokenExpiredError') {
    const message = `Token Expired`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
