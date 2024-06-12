import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import MasterModule from '../../models/Account-Master-Models/MasterModuleModel';
import { TQueryParams, TStatus } from '../../@types/commonTypes';
import { TAccount } from '../../@types/accountTypes';

export const getAllMasterModule = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await MasterModule.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }
    const allMasterModules = await MasterModule.find(query).populate('permissions_ids', 'name code').limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allMasterModules, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getMasterModuleById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const masterModule = await MasterModule.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (masterModule) {
      return res.status(200).json({ masterModule });
    } else {
      return next(new ErrorHandler('There is problem while fetching master module. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getAllMasterModuleByStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const masterModules = await MasterModule.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (masterModules) {
      return res.status(200).json({ masterModules });
    } else {
      return next(new ErrorHandler('There is problem while fetching masterModule. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createMasterModule = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, code, name, permissions_ids } = req.body as TAccount;

    if (!(name || code)) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const masterModuleExists = await MasterModule.findOne({ $or: [{ name }, { code }] });

    if (masterModuleExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const masterModule = await MasterModule.create({ status, code, name, permissions_ids });

    if (masterModule) {
      return res.status(201).json({ message: 'Master module created' });
    } else {
      return next(new ErrorHandler('There is problem while creating master module. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateMasterModule = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, name } = req.body as TAccount;

    const masterModule = await MasterModule.findById({ _id: req.params.id });

    if (masterModule) {
      masterModule.name = name || masterModule.name;
      masterModule.status = status || masterModule.status;

      await masterModule.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Master module updated.' });
    } else {
      return next(new ErrorHandler('Master module not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateMasterModuleStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const masterModule = await MasterModule.findById({ _id: req.params.id });

    if (masterModule) {
      masterModule.status = status || masterModule.status;

      await masterModule.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Master module status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Master module not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any masterModule add a checking through products and metal type if that metal price is not used any product or metal type then you can only delete that metal price

export const deleteMasterModule = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const masterModule = await MasterModule.findById({ _id: req.params.id });

    if (masterModule) {
      await masterModule.deleteOne();
      return res.status(200).json({ message: 'Master module deleted.' });
    } else {
      return next(new ErrorHandler('Master module not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
