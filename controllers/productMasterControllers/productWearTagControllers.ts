import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TQueryParams, TStatus } from '../../@types/commonTypes';
import ProductWearTag from '../../models/Product-Master-Models/ProductWearTagModel';
import { TProductGeneric } from '../../@types/productTypes';

export const getAllProductWearTag = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageNumber, status, name } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};

    const count = await ProductWearTag.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const productWearTags = await ProductWearTag.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ productWearTags, page, pages });
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getProductWearTagById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productWearTag = await ProductWearTag.findById({ _id: req.params.id });
    if (productWearTag) {
      return res.status(200).json({ productWearTag });
    } else {
      return next(new ErrorHandler('Wear tag not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createProductWearTag = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, description } = req.body as TProductGeneric;

    if (!name || !status || !code) {
      return next(new ErrorHandler('Please fill the required details', 400));
    }

    const productWearTagExists = await ProductWearTag.findOne({ $or: [{ name }, { code }] });

    if (productWearTagExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const productWearTag = await ProductWearTag.create({ name, code, status, description });

    if (productWearTag) {
      return res.status(201).json({ message: 'Wear tag created' });
    } else {
      return next(new ErrorHandler('There is problem while creating wear tag. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateProductWearTag = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status, description } = req.body as TProductGeneric;
    const productWearTag = await ProductWearTag.findById({ _id: req.params.id });

    if (productWearTag) {
      productWearTag.name = name || productWearTag.name;
      productWearTag.description = description || productWearTag.description;
      productWearTag.status = status || productWearTag.status;

      await productWearTag.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: 'Wear tag updated!' });
    } else {
      return next(new ErrorHandler('Wear tag not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateProductWearTagStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const productWearTag = await ProductWearTag.findById({ _id: req.params.id });

    if (productWearTag) {
      productWearTag.status = status || productWearTag.status;

      await productWearTag.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Wear tag status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Wear tag not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any category type add a checking through products as well as through categories if that category type is not used any product or category then you can only delete that category type

export const deleteProductWearTag = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productWearTag = await ProductWearTag.findById({ _id: req.params.id });

    if (productWearTag) {
      await productWearTag.deleteOne();

      return res.status(200).json({ message: 'Wear tag deleted!' });
    } else {
      return next(new ErrorHandler('Wear tag not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
