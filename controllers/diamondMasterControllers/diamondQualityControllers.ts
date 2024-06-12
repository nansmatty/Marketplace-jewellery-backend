import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import { TDiamond, TDiamondUpdate } from '../../@types/diamondTypes';
import ErrorHandler from '../../utils/errorHandler';
import DiamondQuality from '../../models/Diamond-Master-Models/DiamondQualityModel';
import { TQueryParams, TStatus } from '../../@types/commonTypes';

export const getAllDiamondQuality = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await DiamondQuality.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const allDiamondQuality = await DiamondQuality.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allDiamondQuality, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getDiamondQualityById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diamondQuality = await DiamondQuality.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (diamondQuality) {
      return res.status(200).json({ diamondQuality });
    } else {
      return next(new ErrorHandler('There is problem while fetching diamond quality. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getDiamondQualityByStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diamondQualities = await DiamondQuality.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (diamondQualities) {
      return res.status(200).json({ diamondQualities });
    } else {
      return next(new ErrorHandler('There is problem while fetching diamond quality. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createDiamondQuality = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description } = req.body as TDiamond;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const diamondQualityExists = await DiamondQuality.findOne({ $or: [{ name }, { code }] });

    if (diamondQualityExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const diamondQuality = await DiamondQuality.create({ name, code, description, status });

    if (diamondQuality) {
      return res.status(201).json({ message: 'Diamond quality created' });
    } else {
      return next(new ErrorHandler('There is problem while creating diamond quality. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateDiamondQuality = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body as TDiamondUpdate;

    const diamondQuality = await DiamondQuality.findById({ _id: req.params.id });

    if (diamondQuality) {
      diamondQuality.name = name || diamondQuality.name;
      diamondQuality.description = description || diamondQuality.description;
      await diamondQuality.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Diamond quality updated.' });
    } else {
      return next(new ErrorHandler('Diamond quality not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateDiamondQualityStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const diamondQuality = await DiamondQuality.findById({ _id: req.params.id });

    if (diamondQuality) {
      diamondQuality.status = status || diamondQuality.status;
      await diamondQuality.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Diamond quality status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Diamond quality not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any diamond quality type add a checking through products if that diamond quality is not used any product then you can only delete that diamond quality

export const deleteDiamondQuality = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diamondQuality = await DiamondQuality.findById({ _id: req.params.id });

    if (diamondQuality) {
      await diamondQuality.deleteOne();
      return res.status(200).json({ message: 'Diamond quality deleted.' });
    } else {
      return next(new ErrorHandler('Diamond quality not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
