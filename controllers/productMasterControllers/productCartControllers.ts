import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';

export const getAllCartData = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    //
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getAllCartDataByUserId = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    //
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const itemAddToCart = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    //
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateItemDataInCart = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    //
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateItemCounterInCart = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    //
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deleteItemDataInCart = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    //
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
