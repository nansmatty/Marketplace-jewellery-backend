import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TQueryDefaultParams, TStatus } from '../../@types/commonTypes';
import { TRingSizes, TRingSizesUpdate } from '../../@types/generalTypes';
import RingSizes from '../../models/General-Master-Models/RingSizesModel';

export const getAllRingSizes = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status, is_default } = req.query as TQueryDefaultParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await RingSizes.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (is_default) {
      query.is_default = is_default;
    }

    if (name) {
      query.name = name;
    }

    const allRingSizes = await RingSizes.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allRingSizes, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getRingSizesById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ringSize = await RingSizes.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (ringSize) {
      return res.status(200).json({ ringSize });
    } else {
      return next(new ErrorHandler('There is problem while fetching ring sizes. Please try after sometime.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createRingSizes = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description, is_default } = req.body as TRingSizes;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const ringSizeExists = await RingSizes.findOne({ $or: [{ name }, { code }] });

    if (ringSizeExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const ringSize = await RingSizes.create({ name, code, description, status, is_default });

    if (ringSize) {
      return res.status(201).json({ message: 'Ring size created successfully.' });
    } else {
      return next(new ErrorHandler('There is problem while creating ring size. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateRingSizes = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, is_default } = req.body as TRingSizesUpdate;

    const ringSize = await RingSizes.findById({ _id: req.params.id });

    if (ringSize) {
      ringSize.name = name || ringSize.name;
      ringSize.description = description || ringSize.description;
      ringSize.status = status || ringSize.status;
      ringSize.is_default = is_default || ringSize.is_default;

      await ringSize.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: 'Ring size updated.' });
    } else {
      return next(new ErrorHandler('Ring size not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateRingSizesStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const ringSize = await RingSizes.findById({ _id: req.params.id });

    if (ringSize) {
      ringSize.status = status || ringSize.status;
      await ringSize.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Ring size status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Ring size not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any diamond clarity type add a checking through products if that diamond clarity is not used any product then you can only delete that diamond clarity

export const deleteRingSizes = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ringSize = await RingSizes.findById({ _id: req.params.id });

    if (ringSize) {
      await ringSize.deleteOne();
      return res.status(200).json({ message: 'Ring size deleted successfully.' });
    } else {
      return next(new ErrorHandler('Ring size not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
