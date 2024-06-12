import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import LabourChargeType from '../../models/Labour-Master-Models/LabourChargeTypeModel';
import { TQueryParams, TStatus } from '../../@types/commonTypes';
import { TLabourChargeType, TLabourChargeTypeUpdate } from '../../@types/labourTypes';

export const getAllLabourChargeType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await LabourChargeType.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const allLabourChargeType = await LabourChargeType.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allLabourChargeType, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getLabourChargeTypeById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const labourChargeType = await LabourChargeType.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (labourChargeType) {
      return res.status(200).json({ labourChargeType });
    } else {
      return next(new ErrorHandler('There is problem while fetching labour charge types. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getLabourChargeTypeByStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const labourChargeTypes = await LabourChargeType.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (labourChargeTypes) {
      return res.status(200).json({ labourChargeTypes });
    } else {
      return next(new ErrorHandler('There is problem while fetching labour charge types. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createLabourChargeType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status } = req.body as TLabourChargeType;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const labourChargeTypeExists = await LabourChargeType.findOne({ $or: [{ name }, { code }] });

    if (labourChargeTypeExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const labourChargeType = await LabourChargeType.create({ name, code, status });

    if (labourChargeType) {
      return res.status(201).json({ message: 'Labour charge type created' });
    } else {
      return next(new ErrorHandler('There is problem while creating labour charge types. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateLabourChargeType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status } = req.body as TLabourChargeTypeUpdate;

    const labourChargeType = await LabourChargeType.findById({ _id: req.params.id });

    if (labourChargeType) {
      labourChargeType.name = name || labourChargeType.name;
      labourChargeType.status = status || labourChargeType.status;

      await labourChargeType.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Labour charge type updated.' });
    } else {
      return next(new ErrorHandler('Labour charge type not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateLabourChargeTypeStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const labourChargeType = await LabourChargeType.findById({ _id: req.params.id });

    if (labourChargeType) {
      labourChargeType.status = status || labourChargeType.status;

      await labourChargeType.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Labour charge type status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Labour charge type not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any labour charge types type add a checking through products if that labour charge types is not used any product then you can only delete that labour charge types

export const deleteLabourChargeType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const labourChargeType = await LabourChargeType.findById({ _id: req.params.id });

    if (labourChargeType) {
      await labourChargeType.deleteOne();

      return res.status(200).json({ message: 'Labour charge type deleted.' });
    } else {
      return next(new ErrorHandler('Labour charge type not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
