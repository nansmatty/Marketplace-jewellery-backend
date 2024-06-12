import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TStatus, TTitleQueryParams } from '../../@types/commonTypes';
import { TCollectionAndStyle } from '../../@types/productTypes';
import Collection from '../../models/Product-Master-Models/CollectionsModel';

export const getAllCollections = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, title, status } = req.query as TTitleQueryParams;

    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};

    const count = await Collection.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (title) {
      query.title = new RegExp(title, 'i');
    }

    const collections = await Collection.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ collections, page, pages });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getCollectionById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (collection) {
      return res.status(200).json({ collection });
    } else {
      return next(new ErrorHandler('Collection not found', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createCollection = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, code, status, category_ids, category_type_ids } = req.body as TCollectionAndStyle;

    if (!title || !code) {
      return next(new ErrorHandler('Please fill the required details', 400));
    }

    const collectionExists = await Collection.findOne({ $or: [{ title }, { code }] });

    if (collectionExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const createCollection = await Collection.create({ title, code, status, category_ids, category_type_ids });

    if (createCollection) {
      return res.status(201).json({ message: 'Collection created' });
    } else {
      return next(new ErrorHandler('There is problem while creating collection. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateCollection = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, status, category_ids, category_type_ids } = req.body as TCollectionAndStyle;
    const collection = await Collection.findById({ _id: req.params.id });

    if (collection) {
      collection.title = title || collection.title;
      collection.status = status || collection.status;

      if (category_ids && category_ids.length > 0) {
        collection.clearCategoryIds();
        collection.category_ids = category_ids;
      }

      if (category_type_ids && category_type_ids.length > 0) {
        collection.clearCategoryTypeIds();
        collection.category_type_ids = category_type_ids;
      }

      await collection.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: 'Collection updated!' });
    } else {
      return next(new ErrorHandler('Collection not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateCollectionStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const collection = await Collection.findById({ _id: req.params.id });

    if (collection) {
      collection.status = status || collection.status;

      await collection.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Collection status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Collection not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deleteCollection = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collection = await Collection.findById({ _id: req.params.id });

    if (collection) {
      await collection.deleteOne();

      return res.status(200).json({ message: 'Collection deleted!' });
    } else {
      return next(new ErrorHandler('Collection not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
