import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TQueryDefaultParams, TStatus } from '../../@types/commonTypes';
import BraceletSize from '../../models/Bangle-Master-Models/BraceletsSizeModel';
import { TBraceletSize, TBraceletSizeUpdate } from '../../@types/bangleBraceletsTypes';

export const getAllBraceletSize = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status, is_default } = req.query as TQueryDefaultParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await BraceletSize.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (is_default) {
      query.is_default = is_default;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const allBraceletSize = await BraceletSize.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allBraceletSize, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getBraceletSizeById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const braceletSize = await BraceletSize.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (braceletSize) {
      return res.status(200).json({ braceletSize });
    } else {
      return next(new ErrorHandler('There is problem while fetching bracelet sizes. Please try after sometime.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createBraceletSize = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description, is_default } = req.body as TBraceletSize;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const braceletSizeExists = await BraceletSize.findOne({ $or: [{ name }, { code }] });

    if (braceletSizeExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const braceletSize = await BraceletSize.create({ name, code, description, status, is_default });

    if (braceletSize) {
      return res.status(201).json({ message: 'Bracelet size created successfully.' });
    } else {
      return next(new ErrorHandler('There is problem while creating bracelet size. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateBraceletSize = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, is_default } = req.body as TBraceletSizeUpdate;

    const braceletSize = await BraceletSize.findById({ _id: req.params.id });

    if (braceletSize) {
      braceletSize.name = name || braceletSize.name;
      braceletSize.description = description || braceletSize.description;
      braceletSize.status = status || braceletSize.status;
      braceletSize.is_default = is_default || braceletSize.is_default;

      await braceletSize.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: 'Bracelet size updated.' });
    } else {
      return next(new ErrorHandler('Bracelet size not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateBraceletSizeStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const braceletSize = await BraceletSize.findById({ _id: req.params.id });

    if (braceletSize) {
      braceletSize.status = status || braceletSize.status;
      await braceletSize.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Bracelet Size status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Bracelet size not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any diamond clarity type add a checking through products if that diamond clarity is not used any product then you can only delete that diamond clarity

export const deleteBraceletSize = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const braceletSize = await BraceletSize.findById({ _id: req.params.id });

    if (braceletSize) {
      await braceletSize.deleteOne();
      return res.status(200).json({ message: 'Bracelet size deleted successfully.' });
    } else {
      return next(new ErrorHandler('Bracelet size not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
