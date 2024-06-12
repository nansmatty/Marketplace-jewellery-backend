import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TCategory, TCategoryTypeQueryParams, TCategoryUpdate } from '../../@types/categoryTypes';
import Category from '../../models/Category-Master-Models/CategoryModel';
import { TStatus } from '../../@types/commonTypes';

export const getAllCategory = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageNumber, status, name, categoryType } = req.query as TCategoryTypeQueryParams;
    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};

    const count = await Category.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    if (categoryType) {
      query.categoryType = categoryType;
    }

    const allCategories = await Category.find(query).populate('categoryType', 'code').limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allCategories, page, pages });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getCategoryById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findById({ _id: req.params.id }).populate('categoryType', 'code').select('-createdAt -updatedAt -__v');

    if (category) {
      return res.status(200).json({ category });
    } else {
      return next(new ErrorHandler('There is problem while fetching category. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createCategory = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, categoryType, status } = req.body as TCategory;

    if (!name || !status || !code || !categoryType) {
      return next(new ErrorHandler('Please fill the required fields', 400));
    }

    const categoryCheck = await Category.findOne({ $or: [{ name }, { code }] });

    if (categoryCheck) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const category = await Category.create({ name, code, categoryType, status });

    if (category) {
      return res.status(201).json({ message: 'Category created' });
    } else {
      return next(new ErrorHandler('There is problem while creating category-type. Please try after sometime', 400));
    }
  } catch (error) {
    // console.error(error);
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateCategory = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, categoryType } = req.body as TCategoryUpdate;
    const category = await Category.findById({ _id: req.params.id });

    if (category) {
      category.name = name || category.name;
      category.categoryType = categoryType || category.categoryType;
      await category.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: 'Category updated' });
    } else {
      return next(new ErrorHandler('There is problem while fetching category. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateTheStatusOfCategory = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;
    const category = await Category.findById({ _id: req.params.id });

    if (category) {
      category.status = status;

      await category.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: 'Category Status updated' });
    } else {
      return next(new ErrorHandler('There is problem while fetching category. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting add checking through products if that category is not used any product then you can only delete that category

export const deleteCategory = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findById({ _id: req.params.id });

    if (category) {
      await category.deleteOne();
      return res.status(200).json({ message: 'Category deleted' });
    } else {
      return next(new ErrorHandler('There is problem while fetching category. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
