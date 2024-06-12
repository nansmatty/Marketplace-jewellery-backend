import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import { TDiamond, TDiamondUpdate } from '../../@types/diamondTypes';
import ErrorHandler from '../../utils/errorHandler';
import DiamondColor from '../../models/Diamond-Master-Models/DiamondColorModel';
import { TQueryParams, TStatus } from '../../@types/commonTypes';

export const getAllDiamondColor = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await DiamondColor.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const allDiamondColor = await DiamondColor.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allDiamondColor, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getDiamondColorById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diamondColor = await DiamondColor.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (diamondColor) {
      return res.status(200).json({ diamondColor });
    } else {
      return next(new ErrorHandler('There is problem while fetching diamond color. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getDiamondColorByStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diamondColors = await DiamondColor.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (diamondColors) {
      return res.status(200).json({ diamondColors });
    } else {
      return next(new ErrorHandler('There is problem while fetching diamond colors. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createDiamondColor = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description } = req.body as TDiamond;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const diamondColorExists = await DiamondColor.findOne({ $or: [{ name }, { code }] });

    if (diamondColorExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const diamondColor = await DiamondColor.create({ name, code, description, status });

    if (diamondColor) {
      return res.status(201).json({ message: 'Diamond color created' });
    } else {
      return next(new ErrorHandler('There is problem while creating diamond color. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateDiamondColor = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body as TDiamondUpdate;

    const diamondColor = await DiamondColor.findById({ _id: req.params.id });

    if (diamondColor) {
      diamondColor.name = name || diamondColor.name;
      diamondColor.description = description || diamondColor.description;
      await diamondColor.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Diamond color updated.' });
    } else {
      return next(new ErrorHandler('Diamond color not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateDiamondColorStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const diamondColor = await DiamondColor.findById({ _id: req.params.id });

    if (diamondColor) {
      diamondColor.status = status || diamondColor.status;
      await diamondColor.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Diamond color status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Diamond color not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any diamond color type add a checking through products if that diamond color is not used any product then you can only delete that diamond color

export const deleteDiamondColor = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diamondColor = await DiamondColor.findById({ _id: req.params.id });

    if (diamondColor) {
      await diamondColor.deleteOne();
      return res.status(200).json({ message: 'Diamond color deleted.' });
    } else {
      return next(new ErrorHandler('Diamond color not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
