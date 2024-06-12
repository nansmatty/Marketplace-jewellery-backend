import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import { TDiamond, TDiamondUpdate } from '../../@types/diamondTypes';
import ErrorHandler from '../../utils/errorHandler';
import DiamondClarity from '../../models/Diamond-Master-Models/DiamondClaritiesModel';
import { TQueryParams, TStatus } from '../../@types/commonTypes';

export const getAllDiamondClarity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await DiamondClarity.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const allDiamondClarity = await DiamondClarity.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allDiamondClarity, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getDiamondClarityById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diamondClarity = await DiamondClarity.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (diamondClarity) {
      return res.status(200).json({ diamondClarity });
    } else {
      return next(new ErrorHandler('There is problem while fetching diamond clarity. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getDiamondClarityByStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diamondClarities = await DiamondClarity.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (diamondClarities) {
      return res.status(200).json({ diamondClarities });
    } else {
      return next(new ErrorHandler('There is problem while fetching diamond clarities. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createDiamondClarity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description } = req.body as TDiamond;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const diamondClarityExists = await DiamondClarity.findOne({ $or: [{ name }, { code }] });

    if (diamondClarityExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const diamondClarity = await DiamondClarity.create({ name, code, description, status });

    if (diamondClarity) {
      return res.status(201).json({ message: 'Diamond clarity created' });
    } else {
      return next(new ErrorHandler('There is problem while creating diamond clarity. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateDiamondClarity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body as TDiamondUpdate;

    const diamondClarity = await DiamondClarity.findById({ _id: req.params.id });

    if (diamondClarity) {
      diamondClarity.name = name || diamondClarity.name;
      diamondClarity.description = description || diamondClarity.description;
      await diamondClarity.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Diamond clarity updated.' });
    } else {
      return next(new ErrorHandler('Diamond clarity not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateDiamondClarityStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const diamondClarity = await DiamondClarity.findById({ _id: req.params.id });

    if (diamondClarity) {
      diamondClarity.status = status || diamondClarity.status;
      await diamondClarity.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Diamond clarity status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Diamond clarity not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any diamond clarity type add a checking through products if that diamond clarity is not used any product then you can only delete that diamond clarity

export const deleteDiamondClarity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diamondClarity = await DiamondClarity.findById({ _id: req.params.id });

    if (diamondClarity) {
      await diamondClarity.deleteOne();
      return res.status(200).json({ message: 'Diamond clarity deleted.' });
    } else {
      return next(new ErrorHandler('Diamond clarity not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
