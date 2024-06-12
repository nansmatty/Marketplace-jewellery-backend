import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import { TDiamond, TDiamondUpdate } from '../../@types/diamondTypes';
import ErrorHandler from '../../utils/errorHandler';
import DiamondShape from '../../models/Diamond-Master-Models/DiamondShapeModel';
import { TQueryParams, TStatus } from '../../@types/commonTypes';

export const getAllDiamondShape = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await DiamondShape.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const allDiamondShape = await DiamondShape.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allDiamondShape, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getDiamondShapeById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diamondShape = await DiamondShape.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (diamondShape) {
      return res.status(200).json({ diamondShape });
    } else {
      return next(new ErrorHandler('There is problem while fetching diamond shape. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getDiamondShapeByStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diamondShapes = await DiamondShape.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (diamondShapes) {
      return res.status(200).json({ diamondShapes });
    } else {
      return next(new ErrorHandler('There is problem while fetching diamond shapes. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createDiamondShape = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description } = req.body as TDiamond;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const diamondShapeExists = await DiamondShape.findOne({ $or: [{ name }, { code }] });

    if (diamondShapeExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const diamondShape = await DiamondShape.create({ name, code, description, status });

    if (diamondShape) {
      return res.status(201).json({ message: 'Diamond shape created' });
    } else {
      return next(new ErrorHandler('There is problem while creating diamond shape. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateDiamondShape = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body as TDiamondUpdate;

    const diamondShape = await DiamondShape.findById({ _id: req.params.id });

    if (diamondShape) {
      diamondShape.name = name || diamondShape.name;
      diamondShape.description = description || diamondShape.description;
      await diamondShape.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Diamond shape updated.' });
    } else {
      return next(new ErrorHandler('Diamond shape not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateDiamondShapeStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const diamondShape = await DiamondShape.findById({ _id: req.params.id });

    if (diamondShape) {
      diamondShape.status = status || diamondShape.status;
      await diamondShape.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Diamond shape status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Diamond shape not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any diamond shape type add a checking through products if that diamond shape is not used any product then you can only delete that diamond shape

export const deleteDiamondShape = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diamondShape = await DiamondShape.findById({ _id: req.params.id });

    if (diamondShape) {
      await diamondShape.deleteOne();
      return res.status(200).json({ message: 'Diamond shape deleted.' });
    } else {
      return next(new ErrorHandler('Diamond shape not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
