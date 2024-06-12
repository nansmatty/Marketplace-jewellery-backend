import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import SolitareLabs from '../../models/Solitare-Master-Models/SolitareLabsModel';
import { TQueryDefaultParams, TStatus } from '../../@types/commonTypes';
import { TSolitare, TSolitareUpdate } from '../../@types/solitareTypes';

export const getAllSolitareLabs = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status, is_default } = req.query as TQueryDefaultParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await SolitareLabs.countDocuments();
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

    const allSolitareLabs = await SolitareLabs.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allSolitareLabs, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitareLabsById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareLabs = await SolitareLabs.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (solitareLabs) {
      return res.status(200).json({ solitareLabs });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare lab. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitareLabsByStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareLabss = await SolitareLabs.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (solitareLabss) {
      return res.status(200).json({ solitareLabss });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare clarities. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createSolitareLabs = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description, is_default } = req.body as TSolitare;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const solitareLabsExists = await SolitareLabs.findOne({ $or: [{ name }, { code }] });

    if (solitareLabsExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const solitareLabs = await SolitareLabs.create({ name, code, description, status, is_default });

    if (solitareLabs) {
      return res.status(201).json({ message: 'Solitare lab created' });
    } else {
      return next(new ErrorHandler('There is problem while creating solitare lab. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitareLabs = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, is_default } = req.body as TSolitareUpdate;

    const solitareLabs = await SolitareLabs.findById({ _id: req.params.id });

    if (solitareLabs) {
      solitareLabs.name = name || solitareLabs.name;
      solitareLabs.description = description || solitareLabs.description;
      solitareLabs.status = status || solitareLabs.status;
      solitareLabs.is_default = is_default || solitareLabs.is_default;

      await solitareLabs.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Solitare lab updated successfully.' });
    } else {
      return next(new ErrorHandler('Solitare lab not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitareLabsStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const solitareLabs = await SolitareLabs.findById({ _id: req.params.id });

    if (solitareLabs) {
      solitareLabs.status = status || solitareLabs.status;

      await solitareLabs.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Solitare lab status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Solitare lab not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any solitare lab type add a checking through products if that solitare lab is not used any product then you can only delete that solitare lab

export const deleteSolitareLabs = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareLabs = await SolitareLabs.findById({ _id: req.params.id });

    if (solitareLabs) {
      await solitareLabs.deleteOne();
      return res.status(200).json({ message: 'Solitare lab deleted successfully.' });
    } else {
      return next(new ErrorHandler('Solitare lab not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
