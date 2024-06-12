import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import { TMetal, TRateChartQueryParams, TMetalUpdate } from '../../@types/metalTypes';
import ErrorHandler from '../../utils/errorHandler';
import MetalPurity from '../../models/Metal-Master-Models/MetalPurityModel';
import { TStatus } from '../../@types/commonTypes';

export const getAllMetalPurity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageNumber, status, name, metalPriceType } = req.query as TRateChartQueryParams;
    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};

    const count = await MetalPurity.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    if (metalPriceType) {
      query.metalPriceType = metalPriceType;
    }

    const allMetalPurity = await MetalPurity.find(query).populate('metalPriceType', 'code').limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v -percentage');

    return res.status(200).json({ allMetalPurity, page, pages });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getMetalPurityById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metalPurity = await MetalPurity.findById({ _id: req.params.id }).populate('metalPriceType', 'code').select('-createdAt -updatedAt -__v');

    if (metalPurity) {
      return res.status(200).json({ metalPurity });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal purity. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getMetalPurityByMetal = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metalPurity = await MetalPurity.find({ metalPriceType: req.params.metalPriceTypeId, status: 'active' }).select('-createdAt -updatedAt -__v');

    if (metalPurity) {
      return res.status(200).json({ metalPurity });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal purity. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createMetalPurity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, metalPriceType, status, description, percentage } = req.body as TMetal;

    if (!(name || code || metalPriceType || percentage)) {
      return next(new ErrorHandler('Please fill the required fields', 400));
    }

    const metalPurityCheck = await MetalPurity.findOne({ $or: [{ name }, { code }] });

    if (metalPurityCheck) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const metalPurity = await MetalPurity.create({ name, code, metalPriceType, percentage, status, description });

    if (metalPurity) {
      return res.status(201).json({ message: 'Metal purity created' });
    } else {
      return next(new ErrorHandler('There is problem while creating metal purity. Please try after sometime', 400));
    }
  } catch (error) {
    // console.error(error);
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateMetalPurity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, metalPriceType, percentage, status } = req.body as TMetalUpdate;
    const metalPurity = await MetalPurity.findById({ _id: req.params.id });

    if (metalPurity) {
      metalPurity.name = name || metalPurity.name;
      metalPurity.description = description || metalPurity.description;
      metalPurity.metalPriceType = metalPriceType || metalPurity.metalPriceType;
      metalPurity.status = status || metalPurity.status;
      metalPurity.percentage = percentage || metalPurity.percentage;
      await metalPurity.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: 'Metal purity updated' });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal purity. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateMetalPurityStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;
    const metalPurity = await MetalPurity.findById({ _id: req.params.id });

    if (metalPurity) {
      metalPurity.status = status || metalPurity.status;
      await metalPurity.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Metal purity status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal purity. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any metal purity add a checking through products if that metal purity is not used any product then you can only delete that metal purity.

export const deleteMetalPurity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metalPurity = await MetalPurity.findById({ _id: req.params.id });

    if (metalPurity) {
      await metalPurity.deleteOne();

      return res.status(200).json({ message: 'Metal purity deleted.' });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal purity. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
