import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import PriceRange from '../../models/Filter-Master-Models/PriceRangeModel';
import { TQueryParams, TStatus } from '../../@types/commonTypes';
import { TPriceRange, TPriceRangeUpdate } from '../../@types/filterTypes';

export const getAllPriceRange = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await PriceRange.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }
    const allPriceRanges = await PriceRange.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allPriceRanges, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getPriceRangeById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const priceRange = await PriceRange.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (priceRange) {
      return res.status(200).json({ priceRange });
    } else {
      return next(new ErrorHandler('There is problem while fetching price range. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getAllPriceRangeByStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const priceRanges = await PriceRange.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (priceRanges) {
      return res.status(200).json({ priceRanges });
    } else {
      return next(new ErrorHandler('There is problem while fetching price range. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createPriceRange = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status, code, description, max_amount, min_amount } = req.body as TPriceRange;

    if (!(name || code || max_amount || min_amount)) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const priceRangeExists = await PriceRange.findOne({ $or: [{ name }, { code }] });

    if (priceRangeExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    if (max_amount <= min_amount) {
      return next(new ErrorHandler('Max Amount should be higher than Min Amount.', 400));
    }

    const priceRange = await PriceRange.create({ name, code, status, description, max_amount, min_amount });

    if (priceRange) {
      return res.status(201).json({ message: 'Price range created' });
    } else {
      return next(new ErrorHandler('There is problem while creating price range. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updatePriceRange = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status, description, max_amount, min_amount } = req.body as TPriceRangeUpdate;

    const priceRange = await PriceRange.findById({ _id: req.params.id });

    if (priceRange) {
      priceRange.name = name || priceRange.name;
      priceRange.status = status || priceRange.status;
      priceRange.description = description || priceRange.description;
      priceRange.max_amount = max_amount || priceRange.max_amount;
      priceRange.min_amount = min_amount || priceRange.min_amount;

      await priceRange.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Price range updated.' });
    } else {
      return next(new ErrorHandler('Price range not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updatePriceRangeStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const priceRange = await PriceRange.findById({ _id: req.params.id });

    if (priceRange) {
      priceRange.status = status || priceRange.status;
      await priceRange.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Price range status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Price range not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any price range add a checking through products and metal type if that metal price is not used any product or metal type then you can only delete that metal price

export const deletePriceRange = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const priceRange = await PriceRange.findById({ _id: req.params.id });

    if (priceRange) {
      await priceRange.deleteOne();
      return res.status(200).json({ message: 'Price range deleted.' });
    } else {
      return next(new ErrorHandler('Price range not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
