import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TQueryParams, TStatus } from '../../@types/commonTypes';
import ShopForModule from '../../models/General-Master-Models/ShopForModuleModel';
import { TGeneral, TGeneralUpdate } from '../../@types/generalTypes';

export const getAllShopForModule = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageNumber, status, name } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};

    const count = await ShopForModule.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const shopForModules = await ShopForModule.find(query).limit(sizeOfPage).skip(skipDoc).select('-updatedAt -__v');

    return res.status(200).json({ shopForModules, page, pages });
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const geTGeneralById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shopForModule = await ShopForModule.findById({ _id: req.params.id });
    if (shopForModule) {
      return res.status(200).json({ shopForModule });
    } else {
      return next(new ErrorHandler('Shop for module not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createShopForModule = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description } = req.body as TGeneral;

    if (!name || !status || !code) {
      return next(new ErrorHandler('Please fill the required details', 400));
    }

    const shopForModuleExists = await ShopForModule.findOne({ $or: [{ name }, { code }] });

    if (shopForModuleExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const shopForModule = await ShopForModule.create({ name, code, status, description });

    if (shopForModule) {
      return res.status(201).json({ message: 'Shop for module created' });
    } else {
      return next(new ErrorHandler('There is problem while creating shop for module. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateShopForModule = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status, description } = req.body as TGeneralUpdate;
    const shopForModule = await ShopForModule.findById({ _id: req.params.id });

    if (shopForModule) {
      shopForModule.name = name || shopForModule.name;
      shopForModule.description = description || shopForModule.description;
      shopForModule.status = status || shopForModule.status;

      await shopForModule.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: 'Shop for module updated!' });
    } else {
      return next(new ErrorHandler('Shop for module not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateShopForModuleStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const shopForModule = await ShopForModule.findById({ _id: req.params.id });

    if (shopForModule) {
      shopForModule.status = status || shopForModule.status;

      await shopForModule.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Shop for module status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Shop for module not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deleteShopForModule = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shopForModule = await ShopForModule.findById({ _id: req.params.id });

    if (shopForModule) {
      await shopForModule.deleteOne();

      return res.status(200).json({ message: 'Shop for module deleted!' });
    } else {
      return next(new ErrorHandler('Shop for module not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
