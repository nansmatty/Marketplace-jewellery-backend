import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import { TDiamond, TDiamondUpdate } from '../../@types/diamondTypes';
import ErrorHandler from '../../utils/errorHandler';
import DiamondSieves from '../../models/Diamond-Master-Models/DiamondSievesModel';
import { TQueryParams, TStatus } from '../../@types/commonTypes';

export const getAllDiamondSieves = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await DiamondSieves.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const allDiamondSieves = await DiamondSieves.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allDiamondSieves, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getDiamondSievesById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diamondSieves = await DiamondSieves.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (diamondSieves) {
      return res.status(200).json({ diamondSieves });
    } else {
      return next(new ErrorHandler('There is problem while fetching diamond sieves. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getDiamondSievesByStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diamondSieves = await DiamondSieves.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (diamondSieves) {
      return res.status(200).json({ diamondSieves });
    } else {
      return next(new ErrorHandler('There is problem while fetching diamond sieves. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createDiamondSieves = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description } = req.body as TDiamond;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const diamondSievesExists = await DiamondSieves.findOne({ $or: [{ name }, { code }] });

    if (diamondSievesExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const diamondSieves = await DiamondSieves.create({ name, code, description, status });

    if (diamondSieves) {
      return res.status(201).json({ message: 'Diamond sieves created' });
    } else {
      return next(new ErrorHandler('There is problem while creating diamond sieves. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateDiamondSieves = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body as TDiamondUpdate;

    const diamondSieves = await DiamondSieves.findById({ _id: req.params.id });

    if (diamondSieves) {
      diamondSieves.name = name || diamondSieves.name;
      diamondSieves.description = description || diamondSieves.description;
      await diamondSieves.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Diamond sieves updated.' });
    } else {
      return next(new ErrorHandler('Diamond sieves not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateDiamondSievesStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const diamondSieves = await DiamondSieves.findById({ _id: req.params.id });

    if (diamondSieves) {
      diamondSieves.status = status || diamondSieves.status;
      await diamondSieves.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Diamond sieves status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Diamond sieves not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any diamond sieves type add a checking through products if that diamond sieves is not used any product then you can only delete that diamond sieves

export const deleteDiamondSieves = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diamondSieves = await DiamondSieves.findById({ _id: req.params.id });

    if (diamondSieves) {
      await diamondSieves.deleteOne();
      return res.status(200).json({ message: 'Diamond sieves deleted.' });
    } else {
      return next(new ErrorHandler('Diamond sieves not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
