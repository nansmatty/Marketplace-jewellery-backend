import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import FixedProductPrice from '../../models/Product-Master-Models/FixedProductPriceModel';

export const getFixedProductPriceByProductId = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fixedProductPrice = await FixedProductPrice.findOne({ product_id: req.params.product_id });

    if (fixedProductPrice) {
      return res.status(200).json({ fixedProductPrice });
    } else {
      return next(new ErrorHandler('Product price not found', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 5000));
  }
});
