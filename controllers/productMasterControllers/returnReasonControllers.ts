import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TQueryParams, TStatus } from '../../@types/commonTypes';
import ReturnReason from '../../models/Product-Master-Models/ReturnReasonModel';
import { TProductGeneric } from '../../@types/productTypes';

export const getAllReturnReason = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageNumber, status, name } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};

    const count = await ReturnReason.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const returnReasons = await ReturnReason.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ returnReasons, page, pages });
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getReturnReasonById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const returnReason = await ReturnReason.findById({ _id: req.params.id });
    if (returnReason) {
      return res.status(200).json({ returnReason });
    } else {
      return next(new ErrorHandler('Return reason not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createReturnReason = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description } = req.body as TProductGeneric;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required details', 400));
    }

    const returnReasonExists = await ReturnReason.findOne({ $or: [{ name }, { code }] });

    if (returnReasonExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const returnReason = await ReturnReason.create({ name, code, status, description });

    if (returnReason) {
      return res.status(201).json({ message: 'Return reason created' });
    } else {
      return next(new ErrorHandler('There is problem while creating return reason. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateReturnReason = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status, description } = req.body as TProductGeneric;
    const returnReason = await ReturnReason.findById({ _id: req.params.id });

    if (returnReason) {
      returnReason.name = name || returnReason.name;
      returnReason.description = description || returnReason.description;
      returnReason.status = status || returnReason.status;

      await returnReason.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: 'Return reason updated!' });
    } else {
      return next(new ErrorHandler('Return reason not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateReturnReasonStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const returnReason = await ReturnReason.findById({ _id: req.params.id });

    if (returnReason) {
      returnReason.status = status || returnReason.status;

      await returnReason.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Return reason status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Return reason not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any category type add a checking through products as well as through categories if that category type is not used any product or category then you can only delete that category type

export const deleteReturnReason = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const returnReason = await ReturnReason.findById({ _id: req.params.id });

    if (returnReason) {
      await returnReason.deleteOne();

      return res.status(200).json({ message: 'Return reason deleted!' });
    } else {
      return next(new ErrorHandler('Return reason not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
