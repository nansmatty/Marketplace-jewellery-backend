import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TQueryParams, TStatus } from '../../@types/commonTypes';
import ProductTag from '../../models/Product-Master-Models/ProductTagModel';
import { TProductTag, TUpdateProductTag } from '../../@types/productTypes';

export const getAllProductTag = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageNumber, status, name } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};

    const count = await ProductTag.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const productTags = await ProductTag.find(query).limit(sizeOfPage).skip(skipDoc).select('-updatedAt -__v');

    return res.status(200).json({ productTags, page, pages });
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getProductTagById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productTag = await ProductTag.findById({ _id: req.params.id });
    if (productTag) {
      return res.status(200).json({ productTag });
    } else {
      return next(new ErrorHandler('Product tag not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createProductTag = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, color } = req.body as TProductTag;

    if (!name || !status || !code) {
      return next(new ErrorHandler('Please fill the required details', 400));
    }

    const productTagExists = await ProductTag.findOne({ $or: [{ name }, { code }] });

    if (productTagExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const productTag = await ProductTag.create({ name, code, status, color });

    if (productTag) {
      return res.status(201).json({ message: 'Product tag created' });
    } else {
      return next(new ErrorHandler('There is problem while creating product tag. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateProductTag = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status, color } = req.body as TUpdateProductTag;
    const productTag = await ProductTag.findById({ _id: req.params.id });

    if (productTag) {
      productTag.name = name || productTag.name;
      productTag.color = color || productTag.color;
      productTag.status = status || productTag.status;

      await productTag.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: 'Product tag updated!' });
    } else {
      return next(new ErrorHandler('Product tag not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateProductTagStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const productTag = await ProductTag.findById({ _id: req.params.id });

    if (productTag) {
      productTag.status = status || productTag.status;

      await productTag.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Product tag status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Product tag not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any category type add a checking through products as well as through categories if that category type is not used any product or category then you can only delete that category type

export const deleteProductTag = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productTag = await ProductTag.findById({ _id: req.params.id });

    if (productTag) {
      await productTag.deleteOne();

      return res.status(200).json({ message: 'Product tag deleted!' });
    } else {
      return next(new ErrorHandler('Product tag not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
