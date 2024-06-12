import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import SolitareSymmetry from '../../models/Solitare-Master-Models/SolitareSymmetryModel';
import { TQueryDefaultParams, TStatus } from '../../@types/commonTypes';
import { TSolitare, TSolitareUpdate } from '../../@types/solitareTypes';

export const getAllSolitareSymmetry = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status, is_default } = req.query as TQueryDefaultParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await SolitareSymmetry.countDocuments();
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

    const allSolitareSymmetry = await SolitareSymmetry.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allSolitareSymmetry, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitareSymmetryById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareSymmetry = await SolitareSymmetry.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (solitareSymmetry) {
      return res.status(200).json({ solitareSymmetry });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare symmetry. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitareSymmetryByStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareSymmetries = await SolitareSymmetry.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (solitareSymmetries) {
      return res.status(200).json({ solitareSymmetries });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare clarities. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createSolitareSymmetry = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description, is_default } = req.body as TSolitare;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const solitareSymmetryExists = await SolitareSymmetry.findOne({ $or: [{ name }, { code }] });

    if (solitareSymmetryExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const solitareSymmetry = await SolitareSymmetry.create({ name, code, description, status, is_default });

    if (solitareSymmetry) {
      return res.status(201).json({ message: 'Solitare symmetry created' });
    } else {
      return next(new ErrorHandler('There is problem while creating solitare symmetry. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitareSymmetry = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, is_default } = req.body as TSolitareUpdate;

    const solitareSymmetry = await SolitareSymmetry.findById({ _id: req.params.id });

    if (solitareSymmetry) {
      solitareSymmetry.name = name || solitareSymmetry.name;
      solitareSymmetry.description = description || solitareSymmetry.description;
      solitareSymmetry.status = status || solitareSymmetry.status;
      solitareSymmetry.is_default = is_default || solitareSymmetry.is_default;

      await solitareSymmetry.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Solitare symmetry updated successfully.' });
    } else {
      return next(new ErrorHandler('Solitare symmetry not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitareSymmetryStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const solitareSymmetry = await SolitareSymmetry.findById({ _id: req.params.id });

    if (solitareSymmetry) {
      solitareSymmetry.status = status || solitareSymmetry.status;

      await solitareSymmetry.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Solitare symmetry status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Solitare symmetry not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any solitare symmetry type add a checking through products if that solitare symmetry is not used any product then you can only delete that solitare symmetry

export const deleteSolitareSymmetry = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareSymmetry = await SolitareSymmetry.findById({ _id: req.params.id });

    if (solitareSymmetry) {
      await solitareSymmetry.deleteOne();
      return res.status(200).json({ message: 'Solitare symmetry deleted successfully.' });
    } else {
      return next(new ErrorHandler('Solitare symmetry not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
