import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TQueryDefaultParams, TStatus } from '../../@types/commonTypes';
import BangleSize from '../../models/Bangle-Master-Models/BangleSizeModel';
import { TBangleSize, TBangleSizeUpdate } from '../../@types/bangleBraceletsTypes';

export const getAllBangleSize = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status, is_default } = req.query as TQueryDefaultParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await BangleSize.countDocuments();
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

    const allBangleSize = await BangleSize.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allBangleSize, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getBangleSizeById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bangleSize = await BangleSize.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (bangleSize) {
      return res.status(200).json({ bangleSize });
    } else {
      return next(new ErrorHandler('There is problem while fetching bangle sizes. Please try after sometime.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createBangleSize = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description, is_default } = req.body as TBangleSize;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const bangleSizeExists = await BangleSize.findOne({ $or: [{ name }, { code }] });

    if (bangleSizeExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const bangleSize = await BangleSize.create({ name, code, description, status, is_default });

    if (bangleSize) {
      return res.status(201).json({ message: 'Bangle size created successfully.' });
    } else {
      return next(new ErrorHandler('There is problem while creating bangle size. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateBangleSize = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, is_default } = req.body as TBangleSizeUpdate;

    const bangleSize = await BangleSize.findById({ _id: req.params.id });

    if (bangleSize) {
      bangleSize.name = name || bangleSize.name;
      bangleSize.description = description || bangleSize.description;
      bangleSize.status = status || bangleSize.status;
      bangleSize.is_default = is_default || bangleSize.is_default;

      await bangleSize.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: 'Bangle size updated.' });
    } else {
      return next(new ErrorHandler('Bangle size not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateBangleSizeStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const bangleSize = await BangleSize.findById({ _id: req.params.id });

    if (bangleSize) {
      bangleSize.status = status || bangleSize.status;
      await bangleSize.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Bangle size status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Bangle size not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any diamond clarity type add a checking through products if that diamond clarity is not used any product then you can only delete that diamond clarity

export const deleteBangleSize = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bangleSize = await BangleSize.findById({ _id: req.params.id });

    if (bangleSize) {
      await bangleSize.deleteOne();
      return res.status(200).json({ message: 'Bangle size deleted successfully.' });
    } else {
      return next(new ErrorHandler('Bangle size not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
