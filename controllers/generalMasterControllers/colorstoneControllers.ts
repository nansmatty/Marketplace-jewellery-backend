import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TQueryParams, TStatus } from '../../@types/commonTypes';
import Colorstone from '../../models/General-Master-Models/ColorstoneModel';
import { TGeneral, TGeneralUpdate } from '../../@types/generalTypes';

export const getAllColorstone = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await Colorstone.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const allColorstone = await Colorstone.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allColorstone, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getColorstoneById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const colorstone = await Colorstone.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (colorstone) {
      return res.status(200).json({ colorstone });
    } else {
      return next(new ErrorHandler('There is problem while fetching colorstone. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createColorstone = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description } = req.body as TGeneral;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const colorstoneExists = await Colorstone.findOne({ $or: [{ name }, { code }] });

    if (colorstoneExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const colorstone = await Colorstone.create({ name, code, description, status });

    if (colorstone) {
      return res.status(201).json({ message: 'Colorstone created' });
    } else {
      return next(new ErrorHandler('There is problem while creating colorstone. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateColorstone = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, status } = req.body as TGeneralUpdate;

    const colorstone = await Colorstone.findById({ _id: req.params.id });

    if (colorstone) {
      colorstone.name = name || colorstone.name;
      colorstone.description = description || colorstone.description;
      colorstone.status = status || colorstone.status;
      await colorstone.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Colorstone updated.' });
    } else {
      return next(new ErrorHandler('Colorstone not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateColorstoneStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const colorstone = await Colorstone.findById({ _id: req.params.id });

    if (colorstone) {
      colorstone.status = status || colorstone.status;
      await colorstone.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Colorstone status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Colorstone not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any colorstone type add a checking through products if that colorstone is not used any product then you can only delete that colorstone

export const deleteColorstone = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const colorstone = await Colorstone.findById({ _id: req.params.id });

    if (colorstone) {
      await colorstone.deleteOne();
      return res.status(200).json({ message: 'Colorstone deleted.' });
    } else {
      return next(new ErrorHandler('Colorstone not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
