import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import Permission from '../../models/Account-Master-Models/PermissionsModel';
import { TName, TQueryParams } from '../../@types/commonTypes';
import { TPermission } from '../../@types/accountTypes';
import MasterModule from '../../models/Account-Master-Models/MasterModuleModel';

export const getAllPermission = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await Permission.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }
    const allPermissions = await Permission.find(query).populate('master_module_id', 'name code').limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allPermissions, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getPermissionById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permission = await Permission.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (permission) {
      return res.status(200).json({ permission });
    } else {
      return next(new ErrorHandler('There is problem while fetching permission. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createPermission = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, name, master_module_id } = req.body as TPermission;

    if (!(name || code || master_module_id)) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const permissionExists = await Permission.findOne({ $or: [{ name }, { code }] });

    if (permissionExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const masterModule = await MasterModule.findById({ _id: master_module_id });

    if (!masterModule) {
      return next(new ErrorHandler('Master module not found', 404));
    }

    const permission = await Permission.create({ code, name, master_module_id });

    if (permission) {
      const updateMasterModule = {
        $push: {
          permissions_ids: permission._id,
        },
      };

      await masterModule.updateOne(updateMasterModule);

      return res.status(201).json({ message: 'Permission created' });
    } else {
      return next(new ErrorHandler('There is problem while creating permission. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updatePermission = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body as TName;

    const permission = await Permission.findById({ _id: req.params.id });

    if (permission) {
      permission.name = name || permission.name;

      await permission.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Permission updated.' });
    } else {
      return next(new ErrorHandler('Permission not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any permission add a checking through products and metal type if that metal price is not used any product or metal type then you can only delete that metal price

export const deletePermission = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permission = await Permission.findById({ _id: req.params.id });

    if (permission) {
      await permission.deleteOne();
      return res.status(200).json({ message: 'Permission deleted.' });
    } else {
      return next(new ErrorHandler('Permission not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
