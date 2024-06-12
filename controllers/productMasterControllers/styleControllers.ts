import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TStatus, TTitleQueryParams } from '../../@types/commonTypes';
import { TCollectionAndStyle } from '../../@types/productTypes';
import Style from '../../models/Product-Master-Models/StyleModel';

export const getAllStyles = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, title, status } = req.query as TTitleQueryParams;

    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};

    const count = await Style.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (title) {
      query.title = new RegExp(title, 'i');
    }

    const styles = await Style.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ styles, page, pages });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getStyleById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const style = await Style.findById(req.params.id);

    if (style) {
      return res.status(200).json({ style });
    } else {
      return next(new ErrorHandler('Style not found', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createStyle = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, code, status, category_ids, category_type_ids } = req.body as TCollectionAndStyle;

    if (!title || !code) {
      return next(new ErrorHandler('Please fill the required details', 400));
    }

    const styleExists = await Style.findOne({ $or: [{ title }, { code }] });

    if (styleExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const createStyle = await Style.create({ title, code, status, category_ids, category_type_ids });

    if (createStyle) {
      return res.status(201).json({ message: 'Style created' });
    } else {
      return next(new ErrorHandler('There is problem while creating style. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateStyle = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, status, category_ids, category_type_ids } = req.body as TCollectionAndStyle;
    const style = await Style.findById({ _id: req.params.id });

    if (style) {
      style.title = title || style.title;
      style.status = status || style.status;

      if (category_ids && category_ids.length > 0) {
        style.clearCategoryIds();
        style.category_ids = category_ids;
      }

      if (category_type_ids && category_type_ids.length > 0) {
        style.clearCategoryTypeIds();
        style.category_type_ids = category_type_ids;
      }

      await style.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: 'Style updated!' });
    } else {
      return next(new ErrorHandler('Style not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateStyleStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const style = await Style.findById({ _id: req.params.id });

    if (style) {
      style.status = status || style.status;

      await style.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Style status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Style not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deleteStyle = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const style = await Style.findById({ _id: req.params.id });

    if (style) {
      await style.deleteOne();

      return res.status(200).json({ message: 'Style deleted!' });
    } else {
      return next(new ErrorHandler('Style not found.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
