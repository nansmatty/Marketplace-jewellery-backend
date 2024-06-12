import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import { TMetal, TRateChartQueryParams, TMetalUpdate } from '../../@types/metalTypes';
import ErrorHandler from '../../utils/errorHandler';
import MetalType from '../../models/Metal-Master-Models/MetalTypeModel';
import { TStatus } from '../../@types/commonTypes';

export const getAllMetalType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageNumber, status, name, metalPriceType } = req.query as TRateChartQueryParams;
    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};

    const count = await MetalType.countDocuments();
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

    const allMetalTypes = await MetalType.find(query).populate('metalPriceType', 'code').limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allMetalTypes, page, pages });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getMetalTypeById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metalType = await MetalType.findById({ _id: req.params.id }).populate('metalPriceType', 'code').select('-createdAt -updatedAt -__v');

    if (metalType) {
      return res.status(200).json({ metalType });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal type. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getMetalTypeByMetalPriceType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metalTypesWithStatusActive = await MetalType.find({ metalPriceType: req.params.metalPriceTypeId, status: 'active' }).select('-createdAt -updatedAt -__v');

    if (metalTypesWithStatusActive) {
      return res.status(200).json({ metalTypesWithStatusActive });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal type. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createMetalType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, metalPriceType, status, description } = req.body as TMetal;

    if (!(name || code || metalPriceType)) {
      return next(new ErrorHandler('Please fill the required fields', 400));
    }

    const metalTypeCheck = await MetalType.findOne({ $or: [{ name }, { code }] });

    if (metalTypeCheck) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const metalType = await MetalType.create({ name, code, metalPriceType, status, description });

    if (metalType) {
      return res.status(201).json({ message: 'Metal type created' });
    } else {
      return next(new ErrorHandler('There is problem while creating metal type. Please try after sometime', 400));
    }
  } catch (error) {
    // console.error(error);
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateMetalType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, metalPriceType } = req.body as TMetalUpdate;
    const metalType = await MetalType.findById({ _id: req.params.id });

    if (metalType) {
      metalType.name = name || metalType.name;
      metalType.description = description || metalType.description;
      metalType.metalPriceType = metalPriceType || metalType.metalPriceType;
      await metalType.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: 'Metal type updated' });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal type. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateMetalTypeStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;
    const metalType = await MetalType.findById({ _id: req.params.id });

    if (metalType) {
      metalType.status = status || metalType.status;
      await metalType.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Metal type status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal type. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any metal type type add a checking through prmetal type is not used any product then you can onmetal type

export const deleteMetalType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metalType = await MetalType.findById({ _id: req.params.id });

    if (metalType) {
      await metalType.deleteOne();

      return res.status(200).json({ message: 'Metal type deleted.' });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal type. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
