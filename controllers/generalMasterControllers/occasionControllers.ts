import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import Occasion from '../../models/General-Master-Models/OccasionModel';
import { TQueryParams, TStatus } from '../../@types/commonTypes';
import { TGeneral, TGeneralUpdate } from '../../@types/generalTypes';

export const getAllOccasion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await Occasion.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }
    const allOccasions = await Occasion.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allOccasions, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getOccasionById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const occasion = await Occasion.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (occasion) {
      return res.status(200).json({ occasion });
    } else {
      return next(new ErrorHandler('There is problem while fetching occasion. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getAllOccasionByStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const occasions = await Occasion.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (occasions) {
      return res.status(200).json({ occasions });
    } else {
      return next(new ErrorHandler('There is problem while fetching occasion. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createOccasion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status, code, description } = req.body as TGeneral;

    if (!(name || code)) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const occasionExists = await Occasion.findOne({ $or: [{ name }, { code }] });

    if (occasionExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const occasion = await Occasion.create({ name, code, status, description });

    if (occasion) {
      return res.status(201).json({ message: 'Occasion created' });
    } else {
      return next(new ErrorHandler('There is problem while creating occasion. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateOccasion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status, description } = req.body as TGeneralUpdate;

    const occasion = await Occasion.findById({ _id: req.params.id });

    if (occasion) {
      occasion.name = name || occasion.name;
      occasion.status = status || occasion.status;
      occasion.description = description || occasion.description;

      await occasion.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Occasion updated.' });
    } else {
      return next(new ErrorHandler('Occasion not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateOccasionStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const occasion = await Occasion.findById({ _id: req.params.id });

    if (occasion) {
      occasion.status = status || occasion.status;

      await occasion.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Occasion status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Occasion not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any occasion add a checking through products and metal type if that metal price is not used any product or metal type then you can only delete that metal price

export const deleteOccasion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const occasion = await Occasion.findById({ _id: req.params.id });

    if (occasion) {
      await occasion.deleteOne();
      return res.status(200).json({ message: 'Occasion deleted.' });
    } else {
      return next(new ErrorHandler('Occasion not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
