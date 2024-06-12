import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import SolitareEyeClean from '../../models/Solitare-Master-Models/SolitareEyeCleanModel';
import { TQueryDefaultParams, TStatus } from '../../@types/commonTypes';
import { TSolitare, TSolitareUpdate } from '../../@types/solitareTypes';

export const getAllSolitareEyeClean = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status, is_default } = req.query as TQueryDefaultParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await SolitareEyeClean.countDocuments();
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

    const allSolitareEyeClean = await SolitareEyeClean.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allSolitareEyeClean, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitareEyeCleanById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareEyeClean = await SolitareEyeClean.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (solitareEyeClean) {
      return res.status(200).json({ solitareEyeClean });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare eye-clean. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitareEyeCleanByStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareEyeCleans = await SolitareEyeClean.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (solitareEyeCleans) {
      return res.status(200).json({ solitareEyeCleans });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare clarities. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createSolitareEyeClean = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description, is_default } = req.body as TSolitare;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const solitareEyeCleanExists = await SolitareEyeClean.findOne({ $or: [{ name }, { code }] });

    if (solitareEyeCleanExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const solitareEyeClean = await SolitareEyeClean.create({ name, code, description, status, is_default });

    if (solitareEyeClean) {
      return res.status(201).json({ message: 'Solitare eye-clean created' });
    } else {
      return next(new ErrorHandler('There is problem while creating solitare eye-clean. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitareEyeClean = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, is_default } = req.body as TSolitareUpdate;

    const solitareEyeClean = await SolitareEyeClean.findById({ _id: req.params.id });

    if (solitareEyeClean) {
      solitareEyeClean.name = name || solitareEyeClean.name;
      solitareEyeClean.description = description || solitareEyeClean.description;
      solitareEyeClean.status = status || solitareEyeClean.status;
      solitareEyeClean.is_default = is_default || solitareEyeClean.is_default;

      await solitareEyeClean.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Solitare eye-clean updated successfully.' });
    } else {
      return next(new ErrorHandler('Solitare eye-clean not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitareEyeCleanStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const solitareEyeClean = await SolitareEyeClean.findById({ _id: req.params.id });

    if (solitareEyeClean) {
      solitareEyeClean.status = status || solitareEyeClean.status;

      await solitareEyeClean.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Solitare eye-clean status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Solitare eye-clean not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any solitare eye-clean type add a checking through products if that solitare eye-clean is not used any product then you can only delete that solitare eye-clean

export const deleteSolitareEyeClean = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareEyeClean = await SolitareEyeClean.findById({ _id: req.params.id });

    if (solitareEyeClean) {
      await solitareEyeClean.deleteOne();
      return res.status(200).json({ message: 'Solitare eye-clean deleted successfully.' });
    } else {
      return next(new ErrorHandler('Solitare eye-clean not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
