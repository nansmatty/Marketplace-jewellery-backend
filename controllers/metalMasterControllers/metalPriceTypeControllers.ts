import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TMetalPriceType } from '../../@types/metalTypes';
import MetalPriceType from '../../models/Metal-Master-Models/MetalPriceTypeModel';
import { TName, TQueryParams, TStatus } from '../../@types/commonTypes';

export const getAllMetalPriceType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await MetalPriceType.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }
    const allMetalPriceTypes = await MetalPriceType.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allMetalPriceTypes, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getMetalPriceTypeById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metalPriceType = await MetalPriceType.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (metalPriceType) {
      return res.status(200).json({ metalPriceType });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal price type. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getAllMetalPriceTypeByStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metalPriceTypes = await MetalPriceType.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (metalPriceTypes) {
      return res.status(200).json({ metalPriceTypes });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal price type. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createMetalPriceType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status, code } = req.body as TMetalPriceType;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const metalPriceTypeExists = await MetalPriceType.findOne({ $or: [{ name }, { code }] });

    if (metalPriceTypeExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const metalPriceType = await MetalPriceType.create({ name, code, status });

    if (metalPriceType) {
      return res.status(201).json({ message: 'Metal price type created' });
    } else {
      return next(new ErrorHandler('There is problem while creating metal price type. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateMetalPriceType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body as TName;

    const metalPriceType = await MetalPriceType.findById({ _id: req.params.id });

    if (metalPriceType) {
      metalPriceType.name = name || metalPriceType.name;
      await metalPriceType.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Metal price type updated.' });
    } else {
      return next(new ErrorHandler('Metal price type not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateMetalPriceTypeStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const metalPriceType = await MetalPriceType.findById({ _id: req.params.id });

    if (metalPriceType) {
      metalPriceType.status = status || metalPriceType.status;
      await metalPriceType.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Metal price type status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Metal price type not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any metal price type add a checking through products and metal type if that metal price is not used any product or metal type then you can only delete that metal price

export const deleteMetalPriceType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metalPriceType = await MetalPriceType.findById({ _id: req.params.id });

    if (metalPriceType) {
      await metalPriceType.deleteOne();
      return res.status(200).json({ message: 'Metal price type deleted.' });
    } else {
      return next(new ErrorHandler('Metal price type not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
