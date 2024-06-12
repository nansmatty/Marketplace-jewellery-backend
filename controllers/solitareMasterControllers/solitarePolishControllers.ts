import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import SolitarePolish from '../../models/Solitare-Master-Models/SolitarePolishModel';
import { TQueryDefaultParams, TStatus } from '../../@types/commonTypes';
import { TSolitare, TSolitareUpdate } from '../../@types/solitareTypes';

export const getAllSolitarePolish = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status, is_default } = req.query as TQueryDefaultParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await SolitarePolish.countDocuments();
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

    const allSolitarePolish = await SolitarePolish.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allSolitarePolish, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitarePolishById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitarePolish = await SolitarePolish.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (solitarePolish) {
      return res.status(200).json({ solitarePolish });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare polish. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitarePolishByStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitarePolishes = await SolitarePolish.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (solitarePolishes) {
      return res.status(200).json({ solitarePolishes });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare clarities. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createSolitarePolish = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description, is_default } = req.body as TSolitare;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const solitarePolishExists = await SolitarePolish.findOne({ $or: [{ name }, { code }] });

    if (solitarePolishExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const solitarePolish = await SolitarePolish.create({ name, code, description, status, is_default });

    if (solitarePolish) {
      return res.status(201).json({ message: 'Solitare polish created' });
    } else {
      return next(new ErrorHandler('There is problem while creating solitare polish. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitarePolish = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, is_default } = req.body as TSolitareUpdate;

    const solitarePolish = await SolitarePolish.findById({ _id: req.params.id });

    if (solitarePolish) {
      solitarePolish.name = name || solitarePolish.name;
      solitarePolish.description = description || solitarePolish.description;
      solitarePolish.status = status || solitarePolish.status;
      solitarePolish.is_default = is_default || solitarePolish.is_default;

      await solitarePolish.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Solitare polish updated successfully.' });
    } else {
      return next(new ErrorHandler('Solitare polish not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitarePolishStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const solitarePolish = await SolitarePolish.findById({ _id: req.params.id });

    if (solitarePolish) {
      solitarePolish.status = status || solitarePolish.status;

      await solitarePolish.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Solitare polish status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Solitare polish not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any solitare polish type add a checking through products if that solitare polish is not used any product then you can only delete that solitare polish

export const deleteSolitarePolish = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitarePolish = await SolitarePolish.findById({ _id: req.params.id });

    if (solitarePolish) {
      await solitarePolish.deleteOne();
      return res.status(200).json({ message: 'Solitare polish deleted successfully.' });
    } else {
      return next(new ErrorHandler('Solitare polish not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
