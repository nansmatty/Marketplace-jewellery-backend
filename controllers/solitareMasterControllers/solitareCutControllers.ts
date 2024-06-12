import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import SolitareCut from '../../models/Solitare-Master-Models/SolitareCutModel';
import { TQueryDefaultParams, TStatus } from '../../@types/commonTypes';
import { TSolitare, TSolitareUpdate } from '../../@types/solitareTypes';

export const getAllSolitareCut = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status, is_default } = req.query as TQueryDefaultParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await SolitareCut.countDocuments();
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

    const allSolitareCut = await SolitareCut.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allSolitareCut, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitareCutById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareCut = await SolitareCut.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (solitareCut) {
      return res.status(200).json({ solitareCut });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare cut. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitareCutByStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareCuts = await SolitareCut.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (solitareCuts) {
      return res.status(200).json({ solitareCuts });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare clarities. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createSolitareCut = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description, is_default } = req.body as TSolitare;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const solitareCutExists = await SolitareCut.findOne({ $or: [{ name }, { code }] });

    if (solitareCutExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const solitareCut = await SolitareCut.create({ name, code, description, status, is_default });

    if (solitareCut) {
      return res.status(201).json({ message: 'Solitare cut created' });
    } else {
      return next(new ErrorHandler('There is problem while creating solitare cut. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitareCut = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, is_default } = req.body as TSolitareUpdate;

    const solitareCut = await SolitareCut.findById({ _id: req.params.id });

    if (solitareCut) {
      solitareCut.name = name || solitareCut.name;
      solitareCut.description = description || solitareCut.description;
      solitareCut.status = status || solitareCut.status;
      solitareCut.is_default = is_default || solitareCut.is_default;

      await solitareCut.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Solitare cut updated successfully.' });
    } else {
      return next(new ErrorHandler('Solitare cut not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitareCutStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const solitareCut = await SolitareCut.findById({ _id: req.params.id });

    if (solitareCut) {
      solitareCut.status = status || solitareCut.status;

      await solitareCut.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Solitare cut status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Solitare cut not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any solitare cut type add a checking through products if that solitare cut is not used any product then you can only delete that solitare cut

export const deleteSolitareCut = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareCut = await SolitareCut.findById({ _id: req.params.id });

    if (solitareCut) {
      await solitareCut.deleteOne();
      return res.status(200).json({ message: 'Solitare cut deleted successfully.' });
    } else {
      return next(new ErrorHandler('Solitare cut not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
