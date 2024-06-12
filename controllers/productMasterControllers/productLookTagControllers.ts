import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TQueryParams, TStatus } from '../../@types/commonTypes';
import ProductLookTag from '../../models/Product-Master-Models/ProductLookTagModel';
import { TProductGeneric } from '../../@types/productTypes';

export const getAllProductLookTag = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageNumber, status, name } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};

    const count = await ProductLookTag.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const productLookTags = await ProductLookTag.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ productLookTags, page, pages });
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getProductLookTagById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productLookTag = await ProductLookTag.findById({ _id: req.params.id });
    if (productLookTag) {
      return res.status(200).json({ productLookTag });
    } else {
      return next(new ErrorHandler('Look tag not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createProductLookTag = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description } = req.body as TProductGeneric;

    if (!(name || code)) {
      return next(new ErrorHandler('Please fill the required details', 400));
    }

    const productLookTagExists = await ProductLookTag.findOne({ $or: [{ name }, { code }] });

    if (productLookTagExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const productLookTag = await ProductLookTag.create({ name, code, status, description });

    if (productLookTag) {
      return res.status(201).json({ message: 'Look tag created' });
    } else {
      return next(new ErrorHandler('There is problem while creating look tag. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateProductLookTag = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status, description } = req.body as TProductGeneric;
    const productLookTag = await ProductLookTag.findById({ _id: req.params.id });

    if (productLookTag) {
      productLookTag.name = name || productLookTag.name;
      productLookTag.description = description || productLookTag.description;
      productLookTag.status = status || productLookTag.status;

      await productLookTag.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: 'Look tag updated!' });
    } else {
      return next(new ErrorHandler('Look tag not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateProductLookTagStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const productLookTag = await ProductLookTag.findById({ _id: req.params.id });

    if (productLookTag) {
      productLookTag.status = status || productLookTag.status;

      await productLookTag.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Look tag status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Look tag not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any category type add a checking through products as well as through categories if that category type is not used any product or category then you can only delete that category type

export const deleteProductLookTag = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productLookTag = await ProductLookTag.findById({ _id: req.params.id });

    if (productLookTag) {
      await productLookTag.deleteOne();

      return res.status(200).json({ message: 'Look tag deleted!' });
    } else {
      return next(new ErrorHandler('Look tag not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
