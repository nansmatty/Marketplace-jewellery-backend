import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TCategoryType } from '../../@types/categoryTypes';
import CategoryType from '../../models/Category-Master-Models/CategoryTypeModel';
import { TName, TQueryParams, TStatus } from '../../@types/commonTypes';

export const getAllCategoryType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageNumber, status, name } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};

    const count = await CategoryType.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const categoryTypes = await CategoryType.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ categoryTypes, page, pages });
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getCategoryTypeById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryType = await CategoryType.findById({ _id: req.params.id });
    if (categoryType) {
      return res.status(200).json({ categoryType });
    } else {
      return next(new ErrorHandler('Category not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createCategoryType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status } = req.body as TCategoryType;

    if (!name || !status || !code) {
      return next(new ErrorHandler('Please fill the required details', 400));
    }

    const categoryNameExistsCheck = await CategoryType.findOne({ $or: [{ name }, { code }] });

    if (categoryNameExistsCheck) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const categoryType = await CategoryType.create({ name, code, status });

    if (categoryType) {
      return res.status(201).json({ message: 'Category-type created' });
    } else {
      return next(new ErrorHandler('There is problem while creating category-type. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateCategoryTypeNameById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body as TName;
    const categoryType = await CategoryType.findById({ _id: req.params.id });

    if (categoryType) {
      categoryType.name = name || categoryType.name;

      await categoryType.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: 'Category-type updated!' });
    } else {
      return next(new ErrorHandler('Category not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateCategoryTypeStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const categoryType = await CategoryType.findById({ _id: req.params.id });

    if (categoryType) {
      categoryType.status = status;

      await categoryType.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: 'Category-type status updated!' });
    } else {
      return next(new ErrorHandler('Category not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any category type add a checking through products as well as through categories if that category type is not used any product or category then you can only delete that category type

export const deleteCategoryType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryType = await CategoryType.findById({ _id: req.params.id });

    if (categoryType) {
      await categoryType.deleteOne();

      return res.status(200).json({ message: 'Category-type deleted!' });
    } else {
      return next(new ErrorHandler('Category not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
