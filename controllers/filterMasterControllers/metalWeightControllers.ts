import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import MetalWeight from '../../models/Filter-Master-Models/MetalWeightModel';
import { TQueryParams, TStatus } from '../../@types/commonTypes';
import { TMetalWeight, TMetalWeightUpdate } from '../../@types/filterTypes';

export const getAllMetalWeight = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await MetalWeight.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }
    const allMetalWeights = await MetalWeight.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allMetalWeights, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getMetalWeightById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metalWeight = await MetalWeight.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (metalWeight) {
      return res.status(200).json({ metalWeight });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal weight. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getAllMetalWeightByStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metalWeights = await MetalWeight.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (metalWeights) {
      return res.status(200).json({ metalWeights });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal weight. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createMetalWeight = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status, code, description, max_weight, min_weight } = req.body as TMetalWeight;

    if (!(name || code || max_weight || min_weight)) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const metalWeightExists = await MetalWeight.findOne({ $or: [{ name }, { code }] });

    if (metalWeightExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const metalWeight = await MetalWeight.create({ name, code, status, description, max_weight, min_weight });

    if (metalWeight) {
      return res.status(201).json({ message: 'Metal weight created' });
    } else {
      return next(new ErrorHandler('There is problem while creating metal weight. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateMetalWeight = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status, description, max_weight, min_weight } = req.body as TMetalWeightUpdate;

    const metalWeight = await MetalWeight.findById({ _id: req.params.id });

    if (metalWeight) {
      metalWeight.name = name || metalWeight.name;
      metalWeight.status = status || metalWeight.status;
      metalWeight.description = description || metalWeight.description;
      metalWeight.max_weight = max_weight || metalWeight.max_weight;
      metalWeight.min_weight = min_weight || metalWeight.min_weight;

      await metalWeight.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Metal weight updated.' });
    } else {
      return next(new ErrorHandler('Metal weight not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateMetalWeightStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const metalWeight = await MetalWeight.findById({ _id: req.params.id });

    if (metalWeight) {
      metalWeight.status = status || metalWeight.status;

      await metalWeight.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Metal weight status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Metal weight not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any metal weight add a checking through products and metal type if that metal price is not used any product or metal type then you can only delete that metal price

export const deleteMetalWeight = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metalWeight = await MetalWeight.findById({ _id: req.params.id });

    if (metalWeight) {
      await metalWeight.deleteOne();
      return res.status(200).json({ message: 'Metal weight deleted.' });
    } else {
      return next(new ErrorHandler('Metal weight not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
