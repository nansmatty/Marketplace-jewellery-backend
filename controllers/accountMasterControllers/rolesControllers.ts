import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import Roles from '../../models/Account-Master-Models/RolesModel';
import { TQueryParams, TStatus } from '../../@types/commonTypes';
import { TAccount } from '../../@types/accountTypes';

export const getAllRoles = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await Roles.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }
    const allRoles = await Roles.find(query).populate('permissions_ids', 'name code').limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allRoles, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getRolesById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await Roles.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (roles) {
      return res.status(200).json({ roles });
    } else {
      return next(new ErrorHandler('There is problem while fetching roles. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getAllRolesByStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await Roles.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (roles) {
      return res.status(200).json({ roles });
    } else {
      return next(new ErrorHandler('There is problem while fetching roles. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createRoles = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, code, name, permissions_ids } = req.body as TAccount;

    if (!(name || code)) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const rolesExists = await Roles.findOne({ $or: [{ name }, { code }] });

    if (rolesExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const roles = await Roles.create({ status, code, name, permissions_ids });

    if (roles) {
      return res.status(201).json({ message: 'Roles created' });
    } else {
      return next(new ErrorHandler('There is problem while creating roles. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateRoles = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, name, permissions_ids } = req.body as TAccount;

    const role = await Roles.findById(req.params.id);

    if (role) {
      role.name = name || role.name;
      role.status = status || role.status;

      // Update permissions_ids using mongoose method
      // role.updatePermissions(permissions_ids);

      if (permissions_ids && permissions_ids.length > 0) {
        role.clearPermissionsIds();

        role.permissions_ids = permissions_ids;
      }

      await role.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Roles updated.' });
    } else {
      return next(new ErrorHandler('Roles not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateRolesStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const roles = await Roles.findById({ _id: req.params.id });

    if (roles) {
      roles.status = status || roles.status;

      await roles.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Roles status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Roles not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any roles add a checking through products and metal type if that metal price is not used any product or metal type then you can only delete that metal price

export const deleteRoles = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await Roles.findById({ _id: req.params.id });

    if (roles) {
      await roles.deleteOne();
      return res.status(200).json({ message: 'Roles deleted.' });
    } else {
      return next(new ErrorHandler('Roles not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
