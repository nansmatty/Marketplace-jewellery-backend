import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import SolitareShape from '../../models/Solitare-Master-Models/SolitareShapeModel';
import { TQueryDefaultParams, TStatus } from '../../@types/commonTypes';
import { TSolitare, TSolitareUpdate } from '../../@types/solitareTypes';

export const getAllSolitareShape = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status, is_default } = req.query as TQueryDefaultParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await SolitareShape.countDocuments();
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

    const allSolitareShape = await SolitareShape.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allSolitareShape, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitareShapeById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareShape = await SolitareShape.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (solitareShape) {
      return res.status(200).json({ solitareShape });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare shape. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitareShapeByStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareShapes = await SolitareShape.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (solitareShapes) {
      return res.status(200).json({ solitareShapes });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare clarities. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createSolitareShape = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description, is_default } = req.body as TSolitare;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const solitareShapeExists = await SolitareShape.findOne({ $or: [{ name }, { code }] });

    if (solitareShapeExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const solitareShape = await SolitareShape.create({ name, code, description, status, is_default });

    if (solitareShape) {
      return res.status(201).json({ message: 'Solitare shape created' });
    } else {
      return next(new ErrorHandler('There is problem while creating solitare shape. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitareShape = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, is_default } = req.body as TSolitareUpdate;

    const solitareShape = await SolitareShape.findById({ _id: req.params.id });

    if (solitareShape) {
      solitareShape.name = name || solitareShape.name;
      solitareShape.description = description || solitareShape.description;
      solitareShape.status = status || solitareShape.status;
      solitareShape.is_default = is_default || solitareShape.is_default;

      await solitareShape.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Solitare shape updated successfully.' });
    } else {
      return next(new ErrorHandler('Solitare shape not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitareShapeStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const solitareShape = await SolitareShape.findById({ _id: req.params.id });

    if (solitareShape) {
      solitareShape.status = status || solitareShape.status;

      await solitareShape.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Solitare shape status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Solitare shape not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any solitare shape type add a checking through products if that solitare shape is not used any product then you can only delete that solitare shape

export const deleteSolitareShape = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareShape = await SolitareShape.findById({ _id: req.params.id });

    if (solitareShape) {
      await solitareShape.deleteOne();
      return res.status(200).json({ message: 'Solitare shape deleted successfully.' });
    } else {
      return next(new ErrorHandler('Solitare shape not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
