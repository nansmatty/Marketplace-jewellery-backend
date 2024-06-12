import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import SolitareFluroscent from '../../models/Solitare-Master-Models/SolitareFluroscentModel';
import { TQueryDefaultParams, TStatus } from '../../@types/commonTypes';
import { TSolitare, TSolitareUpdate } from '../../@types/solitareTypes';

export const getAllSolitareFluroscent = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status, is_default } = req.query as TQueryDefaultParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await SolitareFluroscent.countDocuments();
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

    const allSolitareFluroscent = await SolitareFluroscent.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allSolitareFluroscent, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitareFluroscentById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareFluroscent = await SolitareFluroscent.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (solitareFluroscent) {
      return res.status(200).json({ solitareFluroscent });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare fluroscent. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getSolitareFluroscentByStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareFluroscents = await SolitareFluroscent.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (solitareFluroscents) {
      return res.status(200).json({ solitareFluroscents });
    } else {
      return next(new ErrorHandler('There is problem while fetching solitare clarities. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createSolitareFluroscent = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description, is_default } = req.body as TSolitare;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const solitareFluroscentExists = await SolitareFluroscent.findOne({ $or: [{ name }, { code }] });

    if (solitareFluroscentExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const solitareFluroscent = await SolitareFluroscent.create({ name, code, description, status, is_default });

    if (solitareFluroscent) {
      return res.status(201).json({ message: 'Solitare fluroscent created' });
    } else {
      return next(new ErrorHandler('There is problem while creating solitare fluroscent. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitareFluroscent = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, is_default } = req.body as TSolitareUpdate;

    const solitareFluroscent = await SolitareFluroscent.findById({ _id: req.params.id });

    if (solitareFluroscent) {
      solitareFluroscent.name = name || solitareFluroscent.name;
      solitareFluroscent.description = description || solitareFluroscent.description;
      solitareFluroscent.status = status || solitareFluroscent.status;
      solitareFluroscent.is_default = is_default || solitareFluroscent.is_default;

      await solitareFluroscent.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Solitare fluroscent updated successfully.' });
    } else {
      return next(new ErrorHandler('Solitare fluroscent not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSolitareFluroscentStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const solitareFluroscent = await SolitareFluroscent.findById({ _id: req.params.id });

    if (solitareFluroscent) {
      solitareFluroscent.status = status || solitareFluroscent.status;

      await solitareFluroscent.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Solitare fluroscent status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Solitare fluroscent not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any solitare fluroscent type add a checking through products if that solitare fluroscent is not used any product then you can only delete that solitare fluroscent

export const deleteSolitareFluroscent = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solitareFluroscent = await SolitareFluroscent.findById({ _id: req.params.id });

    if (solitareFluroscent) {
      await solitareFluroscent.deleteOne();
      return res.status(200).json({ message: 'Solitare fluroscent deleted successfully.' });
    } else {
      return next(new ErrorHandler('Solitare fluroscent not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
