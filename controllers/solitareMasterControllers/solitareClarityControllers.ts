import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import SolitareClarity from '../../models/Solitare-Master-Models/SolitareClarityModel';
import { TQueryDefaultParams, TStatus } from '../../@types/commonTypes';
import { TSolitare, TSolitareUpdate } from '../../@types/solitareTypes';

export const getAllSolitareClarity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status, is_default } = req.query as TQueryDefaultParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await SolitareClarity.countDocuments();
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

    const allSolitareClarity = await SolitareClarity.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allSolitareClarity, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitareClarityById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareClarity = await SolitareClarity.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (solitareClarity) {
      return res.status(200).json({ solitareClarity });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare clarity. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitareClarityByStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareClarities = await SolitareClarity.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (solitareClarities) {
      return res.status(200).json({ solitareClarities });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare clarities. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createSolitareClarity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description, is_default } = req.body as TSolitare;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const solitareClarityExists = await SolitareClarity.findOne({ $or: [{ name }, { code }] });

    if (solitareClarityExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const solitareClarity = await SolitareClarity.create({ name, code, description, status, is_default });

    if (solitareClarity) {
      return res.status(201).json({ message: 'Solitare clarity created' });
    } else {
      return next(new ErrorHandler('There is problem while creating solitare clarity. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitareClarity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, is_default } = req.body as TSolitareUpdate;

    const solitareClarity = await SolitareClarity.findById({ _id: req.params.id });

    if (solitareClarity) {
      solitareClarity.name = name || solitareClarity.name;
      solitareClarity.description = description || solitareClarity.description;
      solitareClarity.status = status || solitareClarity.status;
      solitareClarity.is_default = is_default || solitareClarity.is_default;

      await solitareClarity.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Solitare clarity updated successfully.' });
    } else {
      return next(new ErrorHandler('Solitare clarity not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitareClarityStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const solitareClarity = await SolitareClarity.findById({ _id: req.params.id });

    if (solitareClarity) {
      solitareClarity.status = status || solitareClarity.status;

      await solitareClarity.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Solitare clarity status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Solitare clarity not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any solitare clarity type add a checking through products if that solitare clarity is not used any product then you can only delete that solitare clarity

export const deleteSolitareClarity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareClarity = await SolitareClarity.findById({ _id: req.params.id });

    if (solitareClarity) {
      await solitareClarity.deleteOne();
      return res.status(200).json({ message: 'Solitare clarity deleted successfully.' });
    } else {
      return next(new ErrorHandler('Solitare clarity not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
