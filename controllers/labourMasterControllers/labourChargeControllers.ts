import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import LabourCharge from '../../models/Labour-Master-Models/LabourChargeModel';
import { TStatus } from '../../@types/commonTypes';
import { TLabourCharge } from '../../@types/labourTypes';
import { TRateChartQueryParams } from '../../@types/metalTypes';

export const getAllLabourCharge = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status, metalPriceType } = req.query as TRateChartQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await LabourCharge.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    if (metalPriceType) {
      query.metalPriceType = metalPriceType;
    }

    const allLabourCharge = await LabourCharge.find(query).populate('metalPriceType', 'code').limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allLabourCharge, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getLabourChargeById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const labourCharge = await LabourCharge.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (labourCharge) {
      return res.status(200).json({ labourCharge });
    } else {
      return next(new ErrorHandler('There is problem while fetching labour charge. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getLabourChargeByStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const labourCharge = await LabourCharge.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (labourCharge) {
      return res.status(200).json({ labourCharge });
    } else {
      return next(new ErrorHandler('There is problem while fetching labour charge. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createLabourCharge = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description, status, metalPriceType, labourChargeType } = req.body as TLabourCharge;

    if (!labourChargeType || !metalPriceType) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const labourChargeExists = await LabourCharge.findOne({ $and: [{ labourChargeType }, { metalPriceType }] });

    if (labourChargeExists) {
      return next(new ErrorHandler('Labour Charge Type with this Metal Price Type already exists.', 400));
    }

    const labourCharge = await LabourCharge.create({ description, status, metalPriceType, labourChargeType });

    if (labourCharge) {
      return res.status(201).json({ message: 'Labour charge created!' });
    } else {
      return next(new ErrorHandler('There is problem while creating labour charge. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateLabourCharge = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description, status, metalPriceType, labourChargeType } = req.body as TLabourCharge;

    const labourCharge = await LabourCharge.findById({ _id: req.params.id });

    if (labourCharge) {
      labourCharge.description = description || labourCharge.description;
      labourCharge.labourChargeType = labourChargeType || labourCharge.labourChargeType;
      labourCharge.metalPriceType = metalPriceType || labourCharge.metalPriceType;
      labourCharge.status = status || labourCharge.status;

      await labourCharge.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Labour charge updated.' });
    } else {
      return next(new ErrorHandler('Labour charge not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateLabourChargeStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const labourCharge = await LabourCharge.findById({ _id: req.params.id });

    if (labourCharge) {
      labourCharge.status = status || labourCharge.status;

      await labourCharge.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Labour charge status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Labour charge not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any labour charge types type add a checking through products if that labour charge types is not used any product then you can only delete that labour charge

export const deleteLabourCharge = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const labourCharge = await LabourCharge.findById({ _id: req.params.id });

    if (labourCharge) {
      await labourCharge.deleteOne();

      return res.status(200).json({ message: 'Labour charge deleted.' });
    } else {
      return next(new ErrorHandler('Labour charge not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
