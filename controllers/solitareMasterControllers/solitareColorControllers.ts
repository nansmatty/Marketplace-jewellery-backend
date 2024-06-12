import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import SolitareColor from '../../models/Solitare-Master-Models/SolitareColorModel';
import { TQueryDefaultParams, TStatus } from '../../@types/commonTypes';
import { TSolitare, TSolitareUpdate } from '../../@types/solitareTypes';

export const getAllSolitareColor = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status, is_default } = req.query as TQueryDefaultParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await SolitareColor.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    if (is_default) {
      query.is_default = is_default;
    }

    const allSolitareColor = await SolitareColor.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allSolitareColor, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitareColorById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareColor = await SolitareColor.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (solitareColor) {
      return res.status(200).json({ solitareColor });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare color. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitareColorByStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareColors = await SolitareColor.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (solitareColors) {
      return res.status(200).json({ solitareColors });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare colors. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createSolitareColor = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description, is_default } = req.body as TSolitare;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const solitareColorExists = await SolitareColor.findOne({ $or: [{ name }, { code }] });

    if (solitareColorExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const solitareColor = await SolitareColor.create({ name, code, description, status, is_default });

    if (solitareColor) {
      return res.status(201).json({ message: 'Solitare color created' });
    } else {
      return next(new ErrorHandler('There is problem while creating solitare color. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitareColor = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, is_default } = req.body as TSolitareUpdate;

    const solitareColor = await SolitareColor.findById({ _id: req.params.id });

    if (solitareColor) {
      solitareColor.name = name || solitareColor.name;
      solitareColor.description = description || solitareColor.description;
      solitareColor.status = status || solitareColor.status;
      solitareColor.is_default = is_default || solitareColor.is_default;

      await solitareColor.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Solitare color updated successfully.' });
    } else {
      return next(new ErrorHandler('Solitare color not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitareColorStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const solitareColor = await SolitareColor.findById({ _id: req.params.id });

    if (solitareColor) {
      solitareColor.status = status || solitareColor.status;

      await solitareColor.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Solitare color status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Solitare color not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any solitare color type add a checking through products if that solitare color is not used any product then you can only delete that solitare color

export const deleteSolitareColor = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareColor = await SolitareColor.findById({ _id: req.params.id });

    if (solitareColor) {
      await solitareColor.deleteOne();
      return res.status(200).json({ message: 'Solitare color deleted successfully.' });
    } else {
      return next(new ErrorHandler('Solitare color not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
